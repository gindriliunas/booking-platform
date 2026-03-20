import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookingParticipants, clientPackages, clientSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function restoreSession(participant: typeof bookingParticipants.$inferSelect) {
  if (participant.clientPackageId) {
    const [pkg] = await db.select().from(clientPackages).where(eq(clientPackages.id, participant.clientPackageId));
    if (pkg) {
      await db.update(clientPackages).set({
        sessionsUsed: Math.max(0, pkg.sessionsUsed - 1),
        sessionsRemaining: pkg.sessionsRemaining + 1,
        status: "active",
      }).where(eq(clientPackages.id, pkg.id));
    }
  }
  if (participant.clientSubscriptionId) {
    const [sub] = await db.select().from(clientSubscriptions).where(eq(clientSubscriptions.id, participant.clientSubscriptionId));
    if (sub) {
      await db.update(clientSubscriptions).set({
        sessionsUsedThisPeriod: Math.max(0, sub.sessionsUsedThisPeriod - 1),
      }).where(eq(clientSubscriptions.id, sub.id));
    }
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  const { participantId } = await params;
  const body = await req.json();
  const { status } = body;

  const [participant] = await db.select().from(bookingParticipants).where(eq(bookingParticipants.id, participantId));
  if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (status === "cancelled" && participant.status === "booked") {
    await restoreSession(participant);
  }

  const [updated] = await db
    .update(bookingParticipants)
    .set({ status })
    .where(eq(bookingParticipants.id, participantId))
    .returning();

  return NextResponse.json({ participant: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  const { participantId } = await params;

  const [participant] = await db.select().from(bookingParticipants).where(eq(bookingParticipants.id, participantId));
  if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (participant.status === "booked") {
    await restoreSession(participant);
  }

  await db.delete(bookingParticipants).where(eq(bookingParticipants.id, participantId));
  return NextResponse.json({ ok: true });
}
