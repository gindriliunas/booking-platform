import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { bookings, bookingParticipants } from "@/lib/db/schema";
import { eq, and, gte, inArray } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(userId);
    if (!client) return NextResponse.json({ sessions: [] });

    const now = new Date();

    // Upcoming scheduled group sessions for this provider
    const sessionRows = await db
      .select({
        id: bookings.id,
        title: bookings.title,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        maxParticipants: bookings.maxParticipants,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, client.providerId),
          eq(bookings.sessionType, "group"),
          eq(bookings.status, "scheduled"),
          gte(bookings.startTime, now)
        )
      );

    if (sessionRows.length === 0) return NextResponse.json({ sessions: [] });

    const bookingIds = sessionRows.map((r) => r.id);

    // Fetch all participants for these sessions in one query
    const participantRows = await db
      .select({
        bookingId: bookingParticipants.bookingId,
        clientId: bookingParticipants.clientId,
      })
      .from(bookingParticipants)
      .where(
        and(
          inArray(bookingParticipants.bookingId, bookingIds),
          eq(bookingParticipants.status, "booked")
        )
      );

    // Aggregate counts in JS
    const countMap = new Map<string, number>();
    const joinedSet = new Set<string>();
    for (const p of participantRows) {
      countMap.set(p.bookingId, (countMap.get(p.bookingId) ?? 0) + 1);
      if (p.clientId === client.id) joinedSet.add(p.bookingId);
    }

    return NextResponse.json({
      sessions: sessionRows.map((r) => ({
        id: r.id,
        title: r.title ?? "Group Session",
        start: r.startTime.toISOString(),
        end: r.endTime.toISOString(),
        status: r.status,
        maxParticipants: r.maxParticipants,
        participantCount: countMap.get(r.id) ?? 0,
        alreadyJoined: joinedSet.has(r.id),
      })),
    });
  } catch (err) {
    console.error("GET /api/portal/group-sessions error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
