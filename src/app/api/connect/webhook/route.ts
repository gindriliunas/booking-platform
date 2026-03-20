import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, installations, providers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, locationId, contact } = body;

  if (!locationId) return NextResponse.json({ ok: true });

  // Find the provider for this location
  const [install] = await db
    .select()
    .from(installations)
    .where(eq(installations.locationId, locationId));

  if (!install) return NextResponse.json({ ok: true });

  const [provider] = await db
    .select()
    .from(providers)
    .where(eq(providers.installationId, install.id));

  if (!provider) return NextResponse.json({ ok: true });

  if (type === "contact.created" || type === "ContactCreate") {
    // Sync new contact as client
    const existing = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.providerId, provider.id),
          eq(clients.ghlContactId, contact.id)
        )
      );

    if (existing.length === 0) {
      await db.insert(clients).values({
        providerId: provider.id,
        ghlContactId: contact.id,
        name: [contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.email || "Unknown",
        email: contact.email ?? null,
        phone: contact.phone ?? null,
      });
    }
  }

  if (type === "contact.updated" || type === "ContactUpdate") {
    await db
      .update(clients)
      .set({
        name: [contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.email || "Unknown",
        email: contact.email ?? null,
        phone: contact.phone ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clients.providerId, provider.id),
          eq(clients.ghlContactId, contact.id)
        )
      );
  }

  return NextResponse.json({ ok: true });
}
