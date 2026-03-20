import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, questionnaires, clientQuestionnaires } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { requireAdminProvider } from "@/lib/auth-provider";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.providerId, providerId))
    .orderBy(clients.name);

  // Find which clients have pending questionnaires (needs attention badge)
  const pendingForms = rows.length
    ? await db
        .select({ clientId: clientQuestionnaires.clientId })
        .from(clientQuestionnaires)
        .where(
          and(
            inArray(clientQuestionnaires.clientId, rows.map((r) => r.id)),
            eq(clientQuestionnaires.status, "pending")
          )
        )
    : [];

  const pendingClientIds = new Set(pendingForms.map((f) => f.clientId));

  return NextResponse.json({
    clients: rows.map((c) => ({ ...c, hasPendingForm: pendingClientIds.has(c.id) })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { providerId, name, email, phone, notes, ghlContactId } = body;

  if (!providerId || !name) {
    return NextResponse.json({ error: "providerId and name required" }, { status: 400 });
  }

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  const [client] = await db
    .insert(clients)
    .values({
      providerId,
      name,
      email: email ?? null,
      phone: phone ?? null,
      notes: notes ?? null,
      ghlContactId: ghlContactId ?? `manual_${Date.now()}`,
    })
    .returning();

  // Auto-assign any questionnaires marked "assign on join"
  const autoAssign = await db
    .select()
    .from(questionnaires)
    .where(and(eq(questionnaires.providerId, providerId), eq(questionnaires.assignOnJoin, true), eq(questionnaires.isActive, true)));

  if (autoAssign.length) {
    await db.insert(clientQuestionnaires).values(
      autoAssign.map((q) => ({ clientId: client.id, questionnaireId: q.id }))
    );
  }

  return NextResponse.json({ client }, { status: 201 });
}
