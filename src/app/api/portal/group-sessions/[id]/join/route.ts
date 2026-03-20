import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { bookings, bookingParticipants, clientPackages } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { id: bookingId } = await params;

    // Load the group session
    const [session] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.sessionType, "group"),
          eq(bookings.status, "scheduled")
        )
      );

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Check already joined
    const [existing] = await db
      .select()
      .from(bookingParticipants)
      .where(
        and(
          eq(bookingParticipants.bookingId, bookingId),
          eq(bookingParticipants.clientId, client.id),
          eq(bookingParticipants.status, "booked")
        )
      );

    if (existing) return NextResponse.json({ error: "Already joined" }, { status: 409 });

    // Check capacity
    if (session.maxParticipants) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(bookingParticipants)
        .where(
          and(
            eq(bookingParticipants.bookingId, bookingId),
            eq(bookingParticipants.status, "booked")
          )
        );

      if (count >= session.maxParticipants) {
        return NextResponse.json({ error: "Session is full" }, { status: 409 });
      }
    }

    // Deduct from active package if available
    const [activePkg] = await db
      .select()
      .from(clientPackages)
      .where(and(eq(clientPackages.clientId, client.id), eq(clientPackages.status, "active")));

    // Add participant
    await db.insert(bookingParticipants).values({
      bookingId,
      clientId: client.id,
      clientPackageId: activePkg?.id ?? null,
      status: "booked",
    });

    // Deduct session from package
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

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/portal/group-sessions/[id]/join error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
