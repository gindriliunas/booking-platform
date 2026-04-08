import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { bookings, bookingParticipants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(session.uid);
    if (!client) return NextResponse.json({ bookings: [] });

    // Individual bookings (clientId on the booking row)
    const individualRows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.clientId, client.id));

    // Group sessions joined via bookingParticipants
    const participantRows = await db
      .select({ booking: bookings })
      .from(bookingParticipants)
      .innerJoin(bookings, eq(bookingParticipants.bookingId, bookings.id))
      .where(eq(bookingParticipants.clientId, client.id));

    // Merge, deduplicating by id (in case a group session somehow has clientId set)
    const seen = new Set<string>();
    const all = [...individualRows, ...participantRows.map((r) => r.booking)].filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });

    return NextResponse.json({
      bookings: all.map((b) => ({
        id: b.id,
        title: b.title ?? (b.sessionType === "group" ? "Group Session" : "Session"),
        start: b.startTime.toISOString(),
        end: b.endTime.toISOString(),
        status: b.status,
        notes: b.notes,
        sessionType: b.sessionType,
      })),
    });
  } catch (err) {
    console.error("GET /api/portal/bookings error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
