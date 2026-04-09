import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  bookings,
  bookingParticipants,
  clients,
  clientPackages,
  clientSubscriptions,
  packages,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const rows = await db
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

  return NextResponse.json({ participants: rows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { clientId, clientPackageId, clientSubscriptionId } = body;

  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  // Verify session exists and has spots
  const [session] = await db.select().from(bookings).where(eq(bookings.id, id));
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const bookedParticipants = await db
    .select()
    .from(bookingParticipants)
    .where(and(eq(bookingParticipants.bookingId, id), eq(bookingParticipants.status, "booked")));

  if (bookedParticipants.length >= (session.maxParticipants ?? 0)) {
    return NextResponse.json({ error: "Session is full" }, { status: 409 });
  }

  // Check not already a participant
  const [existing] = await db
    .select()
    .from(bookingParticipants)
    .where(
      and(
        eq(bookingParticipants.bookingId, id),
        eq(bookingParticipants.clientId, clientId),
        eq(bookingParticipants.status, "booked")
      )
    );

  if (existing) return NextResponse.json({ error: "Client is already a participant" }, { status: 409 });

  // Validate package is group type if provided (deduction happens at completion)
  if (clientPackageId) {
    const [pkg] = await db
      .select({ cp: clientPackages, p: packages })
      .from(clientPackages)
      .innerJoin(packages, eq(clientPackages.packageId, packages.id))
      .where(eq(clientPackages.id, clientPackageId));

    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    if (pkg.p.sessionType !== "group") return NextResponse.json({ error: "Package is not a group package" }, { status: 400 });
  }

  const [participant] = await db
    .insert(bookingParticipants)
    .values({
      bookingId: id,
      clientId,
      clientPackageId: clientPackageId ?? null,
      clientSubscriptionId: clientSubscriptionId ?? null,
    })
    .returning();

  return NextResponse.json({ participant }, { status: 201 });
}
