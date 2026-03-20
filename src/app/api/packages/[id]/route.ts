import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { packages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, description, sessionCount, sessionDurationMins, price, currency, validityDays, isActive, sessionType } = body;

  const [updated] = await db
    .update(packages)
    .set({
      name,
      description: description ?? null,
      sessionCount: sessionCount ? parseInt(sessionCount) : undefined,
      sessionDurationMins: sessionDurationMins !== undefined ? (sessionDurationMins ? parseInt(sessionDurationMins) : null) : undefined,
      price: price ? parseFloat(price).toFixed(2) : undefined,
      currency: currency ?? undefined,
      validityDays: validityDays != null ? (validityDays ? parseInt(validityDays) : null) : undefined,
      isActive: isActive ?? undefined,
      sessionType: sessionType ?? undefined,
    })
    .where(eq(packages.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ package: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(packages).where(eq(packages.id, id));
  return NextResponse.json({ ok: true });
}
