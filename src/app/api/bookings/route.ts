import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  bookings,
  bookingSeries,
  blockedTimes,
  clientPackages,
  clientSubscriptions,
  providers,
} from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { requireAdminProvider } from "@/lib/auth-provider";
import { addWeeks, addMonths } from "date-fns";
import {
  TRIGGERS,
  fireGhlTrigger,
  fireSessionsUpdatedTrigger,
  getClientTriggerContext,
} from "@/lib/ghl/triggers";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  const [bookingRows, blockedRows] = await Promise.all([
    db.query.bookings.findMany({
      where: eq(bookings.providerId, providerId),
      with: {
        client: true,
        participants: {
          where: (p, { eq }) => eq(p.status, "booked"),
          with: { client: true },
        },
      },
      orderBy: (b, { asc }) => [asc(b.startTime)],
    }),
    db.select().from(blockedTimes).where(eq(blockedTimes.providerId, providerId)),
  ]);

  return NextResponse.json({ bookings: bookingRows, blockedTimes: blockedRows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    providerId,
    clientId,
    title,
    startTime,
    endTime,
    status,
    notes,
    clientPackageId,
    sessionType,
    maxParticipants,
    recurrence, // { frequency: "weekly" | "biweekly" | "monthly"; occurrences: number }
  } = body;

  if (!providerId || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  if (sessionType === "group") {
    if (!maxParticipants || parseInt(maxParticipants) < 2) {
      return NextResponse.json(
        { error: "Group sessions require maxParticipants of at least 2" },
        { status: 400 }
      );
    }
  }

  // ── Recurring series ────────────────────────────────────────────────────────
  if (recurrence && recurrence.occurrences >= 2) {
    const { frequency, occurrences } = recurrence as {
      frequency: "weekly" | "biweekly" | "monthly";
      occurrences: number;
    };

    if (!["weekly", "biweekly", "monthly"].includes(frequency)) {
      return NextResponse.json({ error: "Invalid recurrence frequency" }, { status: 400 });
    }
    if (occurrences < 2 || occurrences > 52) {
      return NextResponse.json({ error: "occurrences must be between 2 and 52" }, { status: 400 });
    }

    // Validate package capacity upfront (before any writes)
    if (clientPackageId && sessionType !== "group") {
      const [pkg] = await db
        .select()
        .from(clientPackages)
        .where(eq(clientPackages.id, clientPackageId));
      if (!pkg || pkg.sessionsRemaining < occurrences) {
        return NextResponse.json(
          {
            error: `Not enough sessions in package (have ${pkg?.sessionsRemaining ?? 0}, need ${occurrences})`,
          },
          { status: 400 }
        );
      }
    }

    const baseStart = new Date(startTime);
    const baseEnd = new Date(endTime);
    const durationMs = baseEnd.getTime() - baseStart.getTime();

    const createdBookings = await db.transaction(async (tx) => {
      // Create the series record
      const [series] = await tx
        .insert(bookingSeries)
        .values({ providerId, frequency, occurrences })
        .returning();

      // Deduct all sessions upfront if package-backed
      if (clientPackageId && sessionType !== "group") {
        const [pkg] = await tx
          .select()
          .from(clientPackages)
          .where(eq(clientPackages.id, clientPackageId));
        if (pkg) {
          await tx.update(clientPackages).set({
            sessionsUsed: pkg.sessionsUsed + occurrences,
            sessionsRemaining: pkg.sessionsRemaining - occurrences,
            status: pkg.sessionsRemaining - occurrences <= 0 ? "exhausted" : "active",
          }).where(eq(clientPackages.id, clientPackageId));
        }
      }

      // Deduct subscription sessions if applicable
      if (body.clientSubscriptionId && sessionType !== "group") {
        const [sub] = await tx
          .select()
          .from(clientSubscriptions)
          .where(eq(clientSubscriptions.id, body.clientSubscriptionId));
        if (sub) {
          await tx.update(clientSubscriptions).set({
            sessionsUsedThisPeriod: sub.sessionsUsedThisPeriod + occurrences,
          }).where(eq(clientSubscriptions.id, sub.id));
        }
      }

      // Insert each occurrence
      const inserted = [];
      for (let i = 0; i < occurrences; i++) {
        let occStart: Date;
        if (frequency === "weekly") occStart = addWeeks(baseStart, i);
        else if (frequency === "biweekly") occStart = addWeeks(baseStart, i * 2);
        else occStart = addMonths(baseStart, i);

        const occEnd = new Date(occStart.getTime() + durationMs);

        const [booking] = await tx.insert(bookings).values({
          providerId,
          clientId: sessionType === "group" ? null : (clientId ?? null),
          title: title ?? (sessionType === "group" ? "Group Session" : "Session"),
          startTime: occStart,
          endTime: occEnd,
          status: status ?? "scheduled",
          notes: notes ?? null,
          clientPackageId: sessionType === "group" ? null : (clientPackageId ?? null),
          clientSubscriptionId: sessionType === "group" ? null : (body.clientSubscriptionId ?? null),
          sessionSource: clientPackageId && sessionType !== "group" ? "package" : "single",
          sessionType: sessionType ?? "individual",
          maxParticipants: sessionType === "group" ? parseInt(maxParticipants) : null,
          bookingSeriesId: series.id,
        }).returning();

        inserted.push(booking);
      }

      return { bookings: inserted, seriesId: series.id };
    });

    // Fire GHL trigger for first booking only (non-blocking)
    const firstBooking = createdBookings.bookings[0];
    if (clientId && sessionType !== "group" && firstBooking) {
      (async () => {
        try {
          const ctx = await getClientTriggerContext(clientId);
          if (!ctx) return;
          const [provider] = await db.select({ name: providers.name }).from(providers).where(eq(providers.id, providerId));
          await fireGhlTrigger(ctx.locationId, ctx.contactId, TRIGGERS.SESSION_BOOKED, {
            bookingId: firstBooking.id,
            sessionDate: firstBooking.startTime.toISOString(),
            sessionTime: firstBooking.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
            sessionDurationMins: Math.round(durationMs / 60000),
            providerName: provider?.name ?? "",
            recurringSeries: true,
            occurrences,
          });
          if (clientPackageId) await fireSessionsUpdatedTrigger(clientPackageId);
        } catch (err) {
          console.error("[GHL Trigger] series session_booked failed:", err);
        }
      })();
    }

    return NextResponse.json(createdBookings, { status: 201 });
  }

  // ── Single booking (original logic) ─────────────────────────────────────────
  if (clientPackageId) {
    const [pkg] = await db
      .select()
      .from(clientPackages)
      .where(eq(clientPackages.id, clientPackageId));
    if (!pkg || pkg.sessionsRemaining <= 0) {
      return NextResponse.json({ error: "No sessions remaining in this package" }, { status: 400 });
    }
    await db.update(clientPackages).set({
      sessionsUsed: pkg.sessionsUsed + 1,
      sessionsRemaining: pkg.sessionsRemaining - 1,
      status: pkg.sessionsRemaining - 1 <= 0 ? "exhausted" : "active",
    }).where(eq(clientPackages.id, clientPackageId));
  }

  const [booking] = await db.insert(bookings).values({
    providerId,
    clientId: sessionType === "group" ? null : (clientId ?? null),
    title: title ?? (sessionType === "group" ? "Group Session" : "Session"),
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    status: status ?? "scheduled",
    notes: notes ?? null,
    clientPackageId: sessionType === "group" ? null : (clientPackageId ?? null),
    sessionSource: clientPackageId && sessionType !== "group" ? "package" : "single",
    sessionType: sessionType ?? "individual",
    maxParticipants: sessionType === "group" ? parseInt(maxParticipants) : null,
  }).returning();

  if (clientId && sessionType !== "group") {
    (async () => {
      try {
        const ctx = await getClientTriggerContext(clientId);
        if (!ctx) return;
        const durationMins = Math.round(
          (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
        );
        const [provider] = await db.select({ name: providers.name }).from(providers).where(eq(providers.id, providerId));
        await fireGhlTrigger(ctx.locationId, ctx.contactId, TRIGGERS.SESSION_BOOKED, {
          bookingId: booking.id,
          sessionDate: booking.startTime.toISOString(),
          sessionTime: booking.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          sessionDurationMins: durationMins,
          providerName: provider?.name ?? "",
        });
        if (clientPackageId) await fireSessionsUpdatedTrigger(clientPackageId);
      } catch (err) {
        console.error("[GHL Trigger] session_booked failed:", err);
      }
    })();
  }

  return NextResponse.json({ booking }, { status: 201 });
}
