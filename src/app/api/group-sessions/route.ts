import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, bookingParticipants } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const rows = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.providerId, providerId),
        eq(bookings.sessionType, "group"),
        eq(bookings.status, "scheduled"),
        gt(bookings.startTime, new Date())
      )
    )
    .orderBy(bookings.startTime);

  const ids = rows.map((r) => r.id);
  const participantCounts: Record<string, number> = {};

  if (ids.length) {
    const participants = await db
      .select({ bookingId: bookingParticipants.bookingId })
      .from(bookingParticipants)
      .where(
        and(
          eq(bookingParticipants.status, "booked"),
          // filter by bookingId in the set
        )
      );
    // Count per bookingId (fetch all booked participants for these bookings)
    const allParticipants = await db
      .select({ bookingId: bookingParticipants.bookingId })
      .from(bookingParticipants)
      .where(eq(bookingParticipants.status, "booked"));

    for (const p of allParticipants) {
      if (ids.includes(p.bookingId)) {
        participantCounts[p.bookingId] = (participantCounts[p.bookingId] ?? 0) + 1;
      }
    }
  }

  const result = rows.map((r) => {
    const count = participantCounts[r.id] ?? 0;
    return {
      ...r,
      participantCount: count,
      spotsRemaining: (r.maxParticipants ?? 0) - count,
    };
  }).filter((r) => r.spotsRemaining > 0);

  return NextResponse.json({ sessions: result });
}
