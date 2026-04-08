import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import {
  bookings,
  bookingParticipants,
  clientPackages,
  clientSubscriptions,
  providers,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";
import { checkAndApplyLateCancelPolicy } from "@/lib/late-cancel";
import { differenceInHours } from "date-fns";
import { notifyNextWaitlistEntry } from "@/lib/waitlist";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await getSession();
    if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(authSession.uid);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { id: bookingId } = await params;
    const body = await req.json().catch(() => ({}));
    const { confirmed = false } = body;

    // Find the client's participant record for this session
    const [participant] = await db
      .select()
      .from(bookingParticipants)
      .where(
        and(
          eq(bookingParticipants.bookingId, bookingId),
          eq(bookingParticipants.clientId, client.id),
          eq(bookingParticipants.status, "booked")
        )
      );

    if (!participant) return NextResponse.json({ error: "Not joined" }, { status: 404 });

    const [groupSession] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!groupSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (groupSession.startTime <= new Date()) {
      return NextResponse.json({ error: "Cannot leave a session that has already started" }, { status: 400 });
    }

    // Check late cancel policy
    const [provider] = await db
      .select({
        lateCancelWindowHours: providers.lateCancelWindowHours,
        lateCancelAction: providers.lateCancelAction,
        lateCancelChargeAmount: providers.lateCancelChargeAmount,
        currency: providers.currency,
      })
      .from(providers)
      .where(eq(providers.id, groupSession.providerId));

    const hoursUntil = differenceInHours(groupSession.startTime, new Date());
    const isLate =
      !!provider?.lateCancelWindowHours &&
      !!provider?.lateCancelAction &&
      hoursUntil < provider.lateCancelWindowHours;

    if (!confirmed && isLate) {
      const action = provider!.lateCancelAction as string;
      let warningMessage = `This session starts in less than ${provider!.lateCancelWindowHours} hours.`;
      if (action === "deduct_session") {
        warningMessage += " Your session credit will not be refunded.";
      } else if (action === "charge") {
        const amount = provider?.lateCancelChargeAmount
          ? parseFloat(provider.lateCancelChargeAmount).toFixed(2)
          : "0.00";
        warningMessage += ` A late cancellation fee of ${(provider?.currency ?? "").toUpperCase()} ${amount} will be charged.`;
      }
      return NextResponse.json({ requiresConfirmation: true, warningMessage, isLate: true });
    }

    // Apply policy
    const result = await checkAndApplyLateCancelPolicy({
      bookingId,
      clientId: client.id,
      providerId: groupSession.providerId,
      sessionStartTime: groupSession.startTime,
      clientPackageId: participant.clientPackageId,
      clientSubscriptionId: participant.clientSubscriptionId,
      isPortalCancel: true,
    });

    // Restore session credit if policy permits
    if (result.shouldRestoreSession) {
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

    await db
      .update(bookingParticipants)
      .set({ status: "cancelled" })
      .where(eq(bookingParticipants.id, participant.id));

    // Notify next waitlist entry (non-blocking)
    notifyNextWaitlistEntry(bookingId, groupSession);

    return NextResponse.json({ ok: true, isLate: result.isLate, outcome: result.outcome });
  } catch (err) {
    console.error("POST /api/portal/group-sessions/[id]/leave error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
