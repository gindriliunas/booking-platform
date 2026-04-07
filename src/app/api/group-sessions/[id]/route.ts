import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, bookingParticipants, clients } from "@/lib/db/schema";
import { eq, and, gte, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [session] = await db.select().from(bookings).where(eq(bookings.id, id));
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const participants = await db
    .select({
      id: bookingParticipants.id,
      clientId: bookingParticipants.clientId,
      clientPackageId: bookingParticipants.clientPackageId,
      clientSubscriptionId: bookingParticipants.clientSubscriptionId,
      status: bookingParticipants.status,
      joinedAt: bookingParticipants.joinedAt,
      clientName: clients.name,
      clientEmail: clients.email,
    })
    .from(bookingParticipants)
    .innerJoin(clients, eq(bookingParticipants.clientId, clients.id))
    .where(eq(bookingParticipants.bookingId, id))
    .orderBy(bookingParticipants.joinedAt);

  const bookedCount = participants.filter((p) => p.status === "booked").length;

  return NextResponse.json({
    session: { ...session, participantCount: bookedCount },
    participants,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { title, startTime, endTime, maxParticipants, status, notes, editScope = "one" } = body;

  const [existing] = await db.select().from(bookings).where(eq(bookings.id, id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Prevent reducing maxParticipants below current booked count
  if (maxParticipants != null) {
    const bookedParticipants = await db
      .select()
      .from(bookingParticipants)
      .where(and(eq(bookingParticipants.bookingId, id), eq(bookingParticipants.status, "booked")));

    if (parseInt(maxParticipants) < bookedParticipants.length) {
      return NextResponse.json(
        { error: `Cannot reduce max participants below current count (${bookedParticipants.length})` },
        { status: 400 }
      );
    }
  }

  // Collect affected bookings for series edits
  let affectedBookings: (typeof bookings.$inferSelect)[] = [existing];
  if (editScope !== "one" && existing.bookingSeriesId) {
    const query =
      editScope === "this_and_future"
        ? and(eq(bookings.bookingSeriesId, existing.bookingSeriesId), gte(bookings.startTime, existing.startTime))
        : eq(bookings.bookingSeriesId, existing.bookingSeriesId);
    affectedBookings = await db.select().from(bookings).where(query).orderBy(asc(bookings.startTime));
  }

  // Compute time delta for series time shifts
  const newStart = startTime ? new Date(startTime) : null;
  const deltaMs = newStart && editScope !== "one" ? newStart.getTime() - existing.startTime.getTime() : 0;
  const durationMs =
    endTime && startTime
      ? new Date(endTime).getTime() - new Date(startTime).getTime()
      : existing.endTime.getTime() - existing.startTime.getTime();

  let firstUpdated: typeof bookings.$inferSelect | undefined;
  for (const b of affectedBookings) {
    const shiftedStart =
      editScope !== "one" && deltaMs !== 0
        ? new Date(b.startTime.getTime() + deltaMs)
        : b.id === id && newStart
        ? newStart
        : undefined;
    const shiftedEnd = shiftedStart
      ? new Date(shiftedStart.getTime() + durationMs)
      : b.id === id && endTime
      ? new Date(endTime)
      : undefined;

    const [updated] = await db
      .update(bookings)
      .set({
        title: title ?? undefined,
        startTime: shiftedStart,
        endTime: shiftedEnd,
        maxParticipants: maxParticipants != null ? parseInt(maxParticipants) : undefined,
        status: status ?? undefined,
        notes: b.id === id ? notes ?? undefined : undefined,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, b.id))
      .returning();

    if (b.id === id) firstUpdated = updated;
  }

  if (!firstUpdated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ session: firstUpdated });
}
