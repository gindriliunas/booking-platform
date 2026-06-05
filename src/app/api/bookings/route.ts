import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, bookingSeries, blockedTimes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminProvider } from "@/lib/auth-provider";
import { addWeeks, addMonths } from "date-fns";

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
          where: (p, { eq: eqFn }) => eqFn(p.status, "booked"),
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
    recurrence,
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

    const baseStart = new Date(startTime);
    const baseEnd = new Date(endTime);
    const durationMs = baseEnd.getTime() - baseStart.getTime();

    const createdBookings = await db.transaction(async (tx) => {
      const [series] = await tx
        .insert(bookingSeries)
        .values({ providerId, frequency, occurrences })
        .returning();

      const inserted = [];
      for (let i = 0; i < occurrences; i++) {
        let occStart: Date;
        if (frequency === "weekly") occStart = addWeeks(baseStart, i);
        else if (frequency === "biweekly") occStart = addWeeks(baseStart, i * 2);
        else occStart = addMonths(baseStart, i);

        const occEnd = new Date(occStart.getTime() + durationMs);

        const [booking] = await tx
          .insert(bookings)
          .values({
            providerId,
            clientId: sessionType === "group" ? null : (clientId ?? null),
            title: title ?? (sessionType === "group" ? "Group Session" : "Session"),
            startTime: occStart,
            endTime: occEnd,
            status: status ?? "scheduled",
            notes: notes ?? null,
            clientPackageId: sessionType === "group" ? null : (clientPackageId ?? null),
            clientSubscriptionId:
              sessionType === "group" ? null : (body.clientSubscriptionId ?? null),
            sessionSource: clientPackageId && sessionType !== "group" ? "package" : "single",
            sessionType: sessionType ?? "individual",
            maxParticipants: sessionType === "group" ? parseInt(maxParticipants) : null,
            bookingSeriesId: series.id,
          })
          .returning();

        inserted.push(booking);
      }

      return { bookings: inserted, seriesId: series.id };
    });

    return NextResponse.json(createdBookings, { status: 201 });
  }

  const [booking] = await db
    .insert(bookings)
    .values({
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
    })
    .returning();

  return NextResponse.json({ booking }, { status: 201 });
}
