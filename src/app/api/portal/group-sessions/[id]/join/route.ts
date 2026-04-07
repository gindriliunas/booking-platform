import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  bookings,
  bookingParticipants,
  clientPackages,
  clientSubscriptions,
  providers,
  waitlistEntries,
} from "@/lib/db/schema";
import { eq, and, sql, max } from "drizzle-orm";
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
    let isFull = false;
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
      isFull = count >= session.maxParticipants;
    }

    // Check provider waitlist setting
    const [provider] = await db
      .select({ enableWaitlist: providers.enableWaitlist })
      .from(providers)
      .where(eq(providers.id, session.providerId));

    if (isFull) {
      if (provider?.enableWaitlist) {
        // Check already on waitlist
        const [existingWait] = await db
          .select()
          .from(waitlistEntries)
          .where(
            and(
              eq(waitlistEntries.bookingId, bookingId),
              eq(waitlistEntries.clientId, client.id),
              eq(waitlistEntries.status, "waiting")
            )
          );
        if (existingWait) {
          return NextResponse.json(
            { waitlisted: true, position: existingWait.position },
            { status: 200 }
          );
        }

        // Get next position
        const [{ maxPos }] = await db
          .select({ maxPos: max(waitlistEntries.position) })
          .from(waitlistEntries)
          .where(
            and(
              eq(waitlistEntries.bookingId, bookingId),
              eq(waitlistEntries.status, "waiting")
            )
          );
        const position = (maxPos ?? 0) + 1;

        await db.insert(waitlistEntries).values({
          bookingId,
          clientId: client.id,
          position,
          status: "waiting",
        });

        return NextResponse.json({ waitlisted: true, position }, { status: 201 });
      }
      return NextResponse.json({ error: "Session is full" }, { status: 409 });
    }

    // Deduct from active package if available
    const [activePkg] = await db
      .select()
      .from(clientPackages)
      .where(and(eq(clientPackages.clientId, client.id), eq(clientPackages.status, "active")));

    // Try subscription if no package
    let clientSubscriptionId: string | null = null;
    if (!activePkg) {
      const [activeSub] = await db
        .select()
        .from(clientSubscriptions)
        .where(and(eq(clientSubscriptions.clientId, client.id), eq(clientSubscriptions.status, "active")));
      if (activeSub && activeSub.sessionsUsedThisPeriod < activeSub.sessionsPerPeriod) {
        clientSubscriptionId = activeSub.id;
        await db.update(clientSubscriptions).set({
          sessionsUsedThisPeriod: activeSub.sessionsUsedThisPeriod + 1,
        }).where(eq(clientSubscriptions.id, activeSub.id));
      }
    }

    await db.insert(bookingParticipants).values({
      bookingId,
      clientId: client.id,
      clientPackageId: activePkg?.id ?? null,
      clientSubscriptionId,
      status: "booked",
    });

    if (activePkg) {
      await db.update(clientPackages).set({
        sessionsUsed: activePkg.sessionsUsed + 1,
        sessionsRemaining: activePkg.sessionsRemaining - 1,
        status: activePkg.sessionsRemaining - 1 <= 0 ? "exhausted" : "active",
      }).where(eq(clientPackages.id, activePkg.id));
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/portal/group-sessions/[id]/join error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
