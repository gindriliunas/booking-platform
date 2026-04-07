import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { bookings, bookingParticipants, providers, waitlistEntries } from "@/lib/db/schema";
import { eq, and, gte, inArray } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(userId);
    if (!client) return NextResponse.json({ sessions: [] });

    const now = new Date();

    const [provider] = await db
      .select({ enableWaitlist: providers.enableWaitlist })
      .from(providers)
      .where(eq(providers.id, client.providerId));

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

    if (sessionRows.length === 0) return NextResponse.json({ sessions: [], enableWaitlist: provider?.enableWaitlist ?? false });

    const bookingIds = sessionRows.map((r) => r.id);

    // Fetch participants and waitlist entries in parallel
    const [participantRows, waitlistRows] = await Promise.all([
      db
        .select({ bookingId: bookingParticipants.bookingId, clientId: bookingParticipants.clientId })
        .from(bookingParticipants)
        .where(
          and(
            inArray(bookingParticipants.bookingId, bookingIds),
            eq(bookingParticipants.status, "booked")
          )
        ),
      db
        .select({
          bookingId: waitlistEntries.bookingId,
          clientId: waitlistEntries.clientId,
          position: waitlistEntries.position,
          status: waitlistEntries.status,
        })
        .from(waitlistEntries)
        .where(
          and(
            inArray(waitlistEntries.bookingId, bookingIds),
            eq(waitlistEntries.clientId, client.id)
          )
        ),
    ]);

    const countMap = new Map<string, number>();
    const joinedSet = new Set<string>();
    for (const p of participantRows) {
      countMap.set(p.bookingId, (countMap.get(p.bookingId) ?? 0) + 1);
      if (p.clientId === client.id) joinedSet.add(p.bookingId);
    }

    // Build a map of waitlist entries for this client
    const waitlistMap = new Map<string, { position: number; status: string }>();
    for (const w of waitlistRows) {
      if (w.status === "waiting" || w.status === "notified") {
        waitlistMap.set(w.bookingId, { position: w.position, status: w.status });
      }
    }

    return NextResponse.json({
      sessions: sessionRows.map((r) => {
        const participantCount = countMap.get(r.id) ?? 0;
        const waitEntry = waitlistMap.get(r.id);
        return {
          id: r.id,
          title: r.title ?? "Group Session",
          start: r.startTime.toISOString(),
          end: r.endTime.toISOString(),
          status: r.status,
          maxParticipants: r.maxParticipants,
          participantCount,
          alreadyJoined: joinedSet.has(r.id),
          isFull: r.maxParticipants != null && participantCount >= r.maxParticipants,
          isWaitlisted: !!waitEntry,
          waitlistPosition: waitEntry?.position ?? null,
          waitlistStatus: waitEntry?.status ?? null,
        };
      }),
      enableWaitlist: provider?.enableWaitlist ?? false,
    });
  } catch (err) {
    console.error("GET /api/portal/group-sessions error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
