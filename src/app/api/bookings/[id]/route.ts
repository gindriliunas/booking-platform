import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, clientPackages, clientSubscriptions, bookingParticipants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { title, startTime, endTime, status, notes, clientId, clientPackageId, sessionType, maxParticipants } = body;

  // If marking as cancelled, restore sessions
  if (status === "cancelled") {
    const [existing] = await db.select().from(bookings).where(eq(bookings.id, id));

    if (existing?.sessionType === "group") {
      // Bulk-restore sessions for all booked participants
      const bookedParticipants = await db
        .select()
        .from(bookingParticipants)
        .where(eq(bookingParticipants.bookingId, id));

      for (const p of bookedParticipants.filter((p) => p.status === "booked")) {
        if (p.clientPackageId) {
          const [pkg] = await db.select().from(clientPackages).where(eq(clientPackages.id, p.clientPackageId));
          if (pkg) {
            await db.update(clientPackages).set({
              sessionsUsed: Math.max(0, pkg.sessionsUsed - 1),
              sessionsRemaining: pkg.sessionsRemaining + 1,
              status: "active",
            }).where(eq(clientPackages.id, pkg.id));
          }
        }
        if (p.clientSubscriptionId) {
          const [sub] = await db.select().from(clientSubscriptions).where(eq(clientSubscriptions.id, p.clientSubscriptionId));
          if (sub) {
            await db.update(clientSubscriptions).set({
              sessionsUsedThisPeriod: Math.max(0, sub.sessionsUsedThisPeriod - 1),
            }).where(eq(clientSubscriptions.id, sub.id));
          }
        }
        await db.update(bookingParticipants).set({ status: "cancelled" }).where(eq(bookingParticipants.id, p.id));
      }
    } else if (existing?.clientPackageId) {
      // Individual session — restore to package
      const [pkg] = await db.select().from(clientPackages).where(eq(clientPackages.id, existing.clientPackageId));
      if (pkg) {
        await db.update(clientPackages).set({
          sessionsUsed: Math.max(0, pkg.sessionsUsed - 1),
          sessionsRemaining: pkg.sessionsRemaining + 1,
          status: "active",
        }).where(eq(clientPackages.id, pkg.id));
      }
    }
  }

  const [updated] = await db
    .update(bookings)
    .set({
      title,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      status,
      notes,
      clientId: sessionType === "group" ? null : clientId,
      maxParticipants: maxParticipants != null ? parseInt(maxParticipants) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning();

  return NextResponse.json({ booking: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(bookings).where(eq(bookings.id, id));
  return NextResponse.json({ ok: true });
}
