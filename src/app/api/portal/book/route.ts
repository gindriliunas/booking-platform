import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { bookings, clientPackages, packages, providers } from "@/lib/db/schema";
import { eq, and, asc, count, or, isNull, gte } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";
import {
  TRIGGERS,
  fireGhlTrigger,
  fireSessionsUpdatedTrigger,
  getClientTriggerContext,
  getLocationIdForProvider,
} from "@/lib/ghl/triggers";

/** Credits are deducted when sessions complete; scheduled bookings still reserve credits. */
async function countScheduledIndividualForPackage(clientPackageId: string) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.clientPackageId, clientPackageId),
        eq(bookings.status, "scheduled"),
        eq(bookings.sessionType, "individual")
      )
    );
  return Number(n ?? 0);
}

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

    // Check provider-level self-booking permission
    const [provider] = await db
      .select({ allowIndividualSelfBook: providers.allowIndividualSelfBook })
      .from(providers)
      .where(eq(providers.id, client.providerId));

    if (!provider?.allowIndividualSelfBook) {
      return NextResponse.json(
        { error: "Self-booking is not enabled. Please contact your provider to schedule a session." },
        { status: 403 }
      );
    }

    const now = new Date();

    // Active self-bookable packages: must have spare credits vs already-scheduled sessions
    const candidateRows = await db
      .select({ clientPackage: clientPackages, pkg: packages })
      .from(clientPackages)
      .innerJoin(packages, eq(clientPackages.packageId, packages.id))
      .where(
        and(
          eq(clientPackages.clientId, client.id),
          eq(clientPackages.status, "active"),
          eq(packages.providerId, client.providerId),
          eq(packages.sessionType, "individual"),
          or(isNull(clientPackages.expiresAt), gte(clientPackages.expiresAt, now))
        )
      )
      .orderBy(asc(clientPackages.purchasedAt));

    let activePkgRow: (typeof candidateRows)[number] | undefined;
    for (const row of candidateRows) {
      if (!row.pkg.allowSelfBook) continue;
      const scheduled = await countScheduledIndividualForPackage(row.clientPackage.id);
      if (row.clientPackage.sessionsRemaining > scheduled) {
        activePkgRow = row;
        break;
      }
    }

    if (!activePkgRow) {
      if (candidateRows.length === 0) {
        return NextResponse.json(
          {
            error:
              "No active session package found. Please purchase a package to book a session.",
          },
          { status: 403 }
        );
      }
      const anySelfBook = candidateRows.some((r) => r.pkg.allowSelfBook);
      if (!anySelfBook) {
        return NextResponse.json(
          {
            error:
              "Self-booking is not enabled for your package(s). Please contact your provider to schedule a session.",
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        {
          error:
            "No session credits available for new bookings. Your upcoming sessions may be using your credits, or your package may be empty — contact your provider if you need help.",
        },
        { status: 403 }
      );
    }

    const activePkg = activePkgRow.clientPackage;

    const [booking] = await db
      .insert(bookings)
      .values({
        providerId: client.providerId,
        clientId: client.id,
        title: "Session",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "scheduled",
        sessionSource: "package",
        clientPackageId: activePkg.id,
      })
      .returning();

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
