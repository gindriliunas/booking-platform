import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { bookings, providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";
import { checkAndApplyLateCancelPolicy } from "@/lib/late-cancel";
import { TRIGGERS, fireGhlTrigger, getClientTriggerContext } from "@/lib/ghl/triggers";
import { differenceInHours } from "date-fns";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(session.uid);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { confirmed = false } = body;

    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.clientId !== client.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (booking.status !== "scheduled") {
      return NextResponse.json({ error: "Booking cannot be cancelled" }, { status: 400 });
    }
    if (booking.startTime <= new Date()) {
      return NextResponse.json({ error: "Cannot cancel a session that has already started" }, { status: 400 });
    }

    const [provider] = await db
      .select({
        lateCancelWindowHours: providers.lateCancelWindowHours,
        lateCancelAction: providers.lateCancelAction,
        lateCancelChargeAmount: providers.lateCancelChargeAmount,
        currency: providers.currency,
      })
      .from(providers)
      .where(eq(providers.id, booking.providerId));

    const hoursUntil = differenceInHours(booking.startTime, new Date());
    const isLate =
      !!provider?.lateCancelWindowHours &&
      !!provider?.lateCancelAction &&
      hoursUntil < provider.lateCancelWindowHours;

    // First call without confirmation: warn the client if it's a late cancel
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

    // Apply policy (handles credit deduction / Stripe charge logging)
    const result = await checkAndApplyLateCancelPolicy({
      bookingId: booking.id,
      clientId: client.id,
      providerId: booking.providerId,
      sessionStartTime: booking.startTime,
      clientPackageId: booking.clientPackageId,
      clientSubscriptionId: booking.clientSubscriptionId,
      isPortalCancel: true,
    });

    const [cancelled] = await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();

    // Fire GHL trigger (non-blocking)
    (async () => {
      try {
        const ctx = await getClientTriggerContext(client.id);
        if (ctx) {
          await fireGhlTrigger(ctx.locationId, ctx.contactId, TRIGGERS.SESSION_CANCELLED, {
            bookingId: cancelled.id,
            sessionDate: cancelled.startTime.toISOString(),
            sessionTime: cancelled.startTime.toLocaleTimeString("en-US", {
              hour: "numeric", minute: "2-digit", hour12: true,
            }),
            sessionDurationMins: Math.round(
              (cancelled.endTime.getTime() - cancelled.startTime.getTime()) / 60000
            ),
            providerName: "",
          });
        }
      } catch (err) {
        console.error("[GHL] portal cancel trigger failed:", err);
      }
    })();

    return NextResponse.json({ ok: true, isLate: result.isLate, outcome: result.outcome });
  } catch (err) {
    console.error("POST /api/portal/bookings/[id]/cancel error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
