import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  bookings,
  bookingParticipants,
  clients,
  clientPackages,
  clientSubscriptions,
  packages,
  subscriptionPlans,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { clientName, clientEmail, providerId } = body;

  if (!clientName || !clientEmail || !providerId) {
    return NextResponse.json({ error: "clientName, clientEmail, and providerId required" }, { status: 400 });
  }

  // Fetch the group session
  const [session] = await db.select().from(bookings).where(eq(bookings.id, id));
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.sessionType !== "group") return NextResponse.json({ error: "Not a group session" }, { status: 400 });
  if (session.status !== "scheduled") return NextResponse.json({ error: "Session is not available" }, { status: 400 });
  if (session.startTime <= new Date()) return NextResponse.json({ error: "Session has already started" }, { status: 400 });

  // Use a transaction to prevent race conditions on spot availability
  const result = await db.transaction(async (tx) => {
    // Count current booked participants
    const bookedParticipants = await tx
      .select()
      .from(bookingParticipants)
      .where(and(eq(bookingParticipants.bookingId, id), eq(bookingParticipants.status, "booked")));

    if (bookedParticipants.length >= (session.maxParticipants ?? 0)) {
      return { error: "This session is full", status: 409 };
    }

    // Find or create client
    let [client] = await tx
      .select()
      .from(clients)
      .where(and(eq(clients.providerId, providerId), eq(clients.email, clientEmail)));

    if (!client) {
      [client] = await tx
        .insert(clients)
        .values({
          providerId,
          name: clientName,
          email: clientEmail,
          ghlContactId: `manual_${Date.now()}`,
        })
        .returning();
    }

    // Check if already joined
    const [existing] = await tx
      .select()
      .from(bookingParticipants)
      .where(
        and(
          eq(bookingParticipants.bookingId, id),
          eq(bookingParticipants.clientId, client.id),
          eq(bookingParticipants.status, "booked")
        )
      );

    if (existing) return { error: "You have already joined this session", status: 409 };

    // Find an active group package for this client
    let clientPackageId: string | null = null;
    let clientSubscriptionId: string | null = null;

    const now = new Date();
    const [groupPkg] = await tx
      .select({ cp: clientPackages })
      .from(clientPackages)
      .innerJoin(packages, eq(clientPackages.packageId, packages.id))
      .where(
        and(
          eq(clientPackages.clientId, client.id),
          eq(clientPackages.status, "active"),
          eq(packages.sessionType, "group")
        )
      )
      .limit(1);

    if (groupPkg && groupPkg.cp.sessionsRemaining > 0) {
      const cp = groupPkg.cp;
      // Check expiry
      if (!cp.expiresAt || cp.expiresAt > now) {
        clientPackageId = cp.id;
        await tx
          .update(clientPackages)
          .set({
            sessionsUsed: cp.sessionsUsed + 1,
            sessionsRemaining: cp.sessionsRemaining - 1,
            status: cp.sessionsRemaining - 1 <= 0 ? "exhausted" : "active",
          })
          .where(eq(clientPackages.id, cp.id));
      }
    }

    if (!clientPackageId) {
      // Try group subscription
      const [groupSub] = await tx
        .select({ cs: clientSubscriptions })
        .from(clientSubscriptions)
        .innerJoin(subscriptionPlans, eq(clientSubscriptions.planId, subscriptionPlans.id))
        .where(
          and(
            eq(clientSubscriptions.clientId, client.id),
            eq(clientSubscriptions.status, "active"),
            eq(subscriptionPlans.sessionType, "group")
          )
        )
        .limit(1);

      if (groupSub && groupSub.cs.sessionsUsedThisPeriod < groupSub.cs.sessionsPerPeriod) {
        clientSubscriptionId = groupSub.cs.id;
        await tx
          .update(clientSubscriptions)
          .set({ sessionsUsedThisPeriod: groupSub.cs.sessionsUsedThisPeriod + 1 })
          .where(eq(clientSubscriptions.id, groupSub.cs.id));
      }
    }

    const [participant] = await tx
      .insert(bookingParticipants)
      .values({
        bookingId: id,
        clientId: client.id,
        clientPackageId,
        clientSubscriptionId,
      })
      .returning();

    return { participant, client, sessionDeducted: !!(clientPackageId || clientSubscriptionId) };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result, { status: 201 });
}
