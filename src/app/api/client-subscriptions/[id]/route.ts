import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status, paymentMethod } = body;

  const [updated] = await db
    .update(clientSubscriptions)
    .set({
      ...(status !== undefined && { status }),
      ...(status === "cancelled" && { cancelledAt: new Date() }),
      ...(paymentMethod !== undefined && { paymentMethod }),
    })
    .where(eq(clientSubscriptions.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ clientSubscription: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(clientSubscriptions).where(eq(clientSubscriptions.id, id));
  return NextResponse.json({ ok: true });
}
