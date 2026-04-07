import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptionPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, description, sessionsPerPeriod, sessionDurationMins, price, currency, isActive, isPublic, sessionType } = body;

  const [updated] = await db
    .update(subscriptionPlans)
    .set({
      name,
      description: description ?? null,
      sessionsPerPeriod: sessionsPerPeriod ? parseInt(sessionsPerPeriod) : undefined,
      sessionDurationMins: sessionDurationMins !== undefined ? (sessionDurationMins ? parseInt(sessionDurationMins) : null) : undefined,
      price: price ? parseFloat(price).toFixed(2) : undefined,
      currency: currency ?? undefined,
      isActive: isActive ?? undefined,
      isPublic: isPublic ?? undefined,
      sessionType: sessionType ?? undefined,
    })
    .where(eq(subscriptionPlans.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ plan: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  return NextResponse.json({ ok: true });
}
