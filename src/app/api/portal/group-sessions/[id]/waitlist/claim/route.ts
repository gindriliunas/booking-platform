import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import {
  bookings,
  bookingParticipants,
  clientPackages,
  clientSubscriptions,
  waitlistEntries,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";

// POST: notified client claims their waitlist spot
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(session.email);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { id: bookingId } = await params;

    const result = await db.transaction(async (tx) => {
      // Verify the client has a "notified" waitlist entry
      const [entry] = await tx
        .select()
        .from(waitlistEntries)
        .where(
          and(
            eq(waitlistEntries.bookingId, bookingId),
            eq(waitlistEntries.clientId, client.id),
            eq(waitlistEntries.status, "notified")
          )
        );

      if (!entry) return { error: "No waitlist spot available to claim", status: 404 };

      // Re-check capacity (race condition guard)
      const [session] = await tx
        .select()
        .from(bookings)
        .where(and(eq(bookings.id, bookingId), eq(bookings.status, "scheduled")));

      if (!session) return { error: "Session not found or no longer available", status: 404 };

      if (session.maxParticipants) {
        const [{ count }] = await tx
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(bookingParticipants)
          .where(
            and(
              eq(bookingParticipants.bookingId, bookingId),
              eq(bookingParticipants.status, "booked")
            )
          );

        if (count >= session.maxParticipants) {
          // Someone else got the spot — put client back to waiting
          await tx
            .update(waitlistEntries)
            .set({ status: "waiting", notifiedAt: null })
            .where(eq(waitlistEntries.id, entry.id));
          return { error: "Spot was taken — you remain on the waitlist", status: 409 };
        }
      }

      // Deduct from active package if available
      const [activePkg] = await tx
        .select()
        .from(clientPackages)
        .where(and(eq(clientPackages.clientId, client.id), eq(clientPackages.status, "active")));

      let clientSubscriptionId: string | null = null;

      if (activePkg) {
        await tx.update(clientPackages).set({
          sessionsUsed: activePkg.sessionsUsed + 1,
          sessionsRemaining: activePkg.sessionsRemaining - 1,
          status: activePkg.sessionsRemaining - 1 <= 0 ? "exhausted" : "active",
        }).where(eq(clientPackages.id, activePkg.id));
      } else {
        const [activeSub] = await tx
          .select()
          .from(clientSubscriptions)
          .where(and(eq(clientSubscriptions.clientId, client.id), eq(clientSubscriptions.status, "active")));
        if (activeSub && activeSub.sessionsUsedThisPeriod < activeSub.sessionsPerPeriod) {
          clientSubscriptionId = activeSub.id;
          await tx.update(clientSubscriptions).set({
            sessionsUsedThisPeriod: activeSub.sessionsUsedThisPeriod + 1,
          }).where(eq(clientSubscriptions.id, activeSub.id));
        }
      }

      // Create participant record
      const [participant] = await tx
        .insert(bookingParticipants)
        .values({
          bookingId,
          clientId: client.id,
          clientPackageId: activePkg?.id ?? null,
          clientSubscriptionId,
          status: "booked",
        })
        .returning();

      // Mark waitlist entry as expired (consumed)
      await tx
        .update(waitlistEntries)
        .set({ status: "expired" })
        .where(eq(waitlistEntries.id, entry.id));

      return { participant, ok: true };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/portal/group-sessions/[id]/waitlist/claim error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
