import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { bookings, clientPackages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";
import {
  TRIGGERS,
  fireGhlTrigger,
  fireSessionsUpdatedTrigger,
  getClientTriggerContext,
  getLocationIdForProvider,
} from "@/lib/ghl/triggers";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(session.uid);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { startTime, endTime } = await req.json();
    if (!startTime || !endTime) {
      return NextResponse.json({ error: "startTime and endTime required" }, { status: 400 });
    }

    // Deduct from active package if available
    const [activePkg] = await db
      .select()
      .from(clientPackages)
      .where(and(eq(clientPackages.clientId, client.id), eq(clientPackages.status, "active")));

    const [booking] = await db
      .insert(bookings)
      .values({
        providerId: client.providerId,
        clientId: client.id,
        title: "Session",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "scheduled",
        sessionSource: activePkg ? "package" : "single",
        clientPackageId: activePkg?.id ?? null,
      })
      .returning();

    if (activePkg) {
      const newUsed = activePkg.sessionsUsed + 1;
      const newRemaining = activePkg.sessionsRemaining - 1;
      await db
        .update(clientPackages)
        .set({
          sessionsUsed: newUsed,
          sessionsRemaining: newRemaining,
          status: newRemaining <= 0 ? "exhausted" : "active",
        })
        .where(eq(clientPackages.id, activePkg.id));
    }

    // Fire GHL triggers (non-blocking)
    (async () => {
      try {
        const ctx = await getClientTriggerContext(client.id);
        if (!ctx) return;

        const locationId = ctx.locationId ?? await getLocationIdForProvider(client.providerId);
        if (!locationId) return;

        const durationMins = Math.round(
          (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
        );

        await fireGhlTrigger(locationId, ctx.contactId, TRIGGERS.SESSION_BOOKED, {
          bookingId: booking.id,
          sessionDate: booking.startTime.toISOString(),
          sessionTime: booking.startTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          sessionDurationMins: durationMins,
          providerName: "",
        });

        if (activePkg) {
          await fireSessionsUpdatedTrigger(activePkg.id);
        }
      } catch (err) {
        console.error("[GHL Trigger] portal session_booked failed:", err);
      }
    })();

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error("POST /api/portal/book error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
