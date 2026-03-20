import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, bookings, clientPackages, packages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Public booking endpoint — used by /book/[providerId]
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { providerId, clientName, clientEmail, startTime, endTime } = body;

  if (!providerId || !clientName || !clientEmail || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Find or create the client record
  let [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.providerId, providerId), eq(clients.email, clientEmail)));

  if (!client) {
    [client] = await db
      .insert(clients)
      .values({
        providerId,
        name: clientName,
        email: clientEmail,
        ghlContactId: `self_book_${Date.now()}`,
      })
      .returning();
  }

  // Find an active individual package to deduct from (if any)
  const [activePkg] = await db
    .select({ cp: clientPackages })
    .from(clientPackages)
    .innerJoin(packages, eq(clientPackages.packageId, packages.id))
    .where(and(
      eq(clientPackages.clientId, client.id),
      eq(clientPackages.status, "active"),
      eq(packages.sessionType, "individual"),
    ))
    .then((rows) => rows.map((r) => r.cp));

  // Create the booking
  const [booking] = await db
    .insert(bookings)
    .values({
      providerId,
      clientId: client.id,
      title: "Session",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: "scheduled",
      sessionSource: activePkg ? "package" : "single",
      clientPackageId: activePkg?.id ?? null,
    })
    .returning();

  // Deduct session from package if one was found
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

  return NextResponse.json({ booking, client }, { status: 201 });
}
