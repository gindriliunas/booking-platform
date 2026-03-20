import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, bookingParticipants, clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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
  const { title, startTime, endTime, maxParticipants, status, notes } = body;

  // Prevent reducing maxParticipants below current booked count
  if (maxParticipants != null) {
    const bookedCount = await db
      .select()
      .from(bookingParticipants)
      .where(and(eq(bookingParticipants.bookingId, id), eq(bookingParticipants.status, "booked")));

    if (parseInt(maxParticipants) < bookedCount.length) {
      return NextResponse.json(
        { error: `Cannot reduce max participants below current count (${bookedCount.length})` },
        { status: 400 }
      );
    }
  }

  const [updated] = await db
    .update(bookings)
    .set({
      title: title ?? undefined,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      maxParticipants: maxParticipants != null ? parseInt(maxParticipants) : undefined,
      status: status ?? undefined,
      notes: notes ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ session: updated });
}
