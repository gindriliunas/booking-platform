import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { waitlistEntries } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";

// GET: client checks their waitlist position
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(userId);
    if (!client) return NextResponse.json({ onWaitlist: false });

    const { id: bookingId } = await params;

    const [entry] = await db
      .select()
      .from(waitlistEntries)
      .where(
        and(
          eq(waitlistEntries.bookingId, bookingId),
          eq(waitlistEntries.clientId, client.id)
        )
      );

    if (!entry || entry.status === "cancelled" || entry.status === "expired") {
      return NextResponse.json({ onWaitlist: false });
    }

    return NextResponse.json({
      onWaitlist: true,
      position: entry.position,
      status: entry.status,
      notifiedAt: entry.notifiedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("GET /api/portal/group-sessions/[id]/waitlist error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE: client leaves the waitlist
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { id: bookingId } = await params;

    const [entry] = await db
      .select()
      .from(waitlistEntries)
      .where(
        and(
          eq(waitlistEntries.bookingId, bookingId),
          eq(waitlistEntries.clientId, client.id),
          eq(waitlistEntries.status, "waiting")
        )
      );

    if (!entry) return NextResponse.json({ error: "Not on waitlist" }, { status: 404 });

    // Mark as cancelled
    await db
      .update(waitlistEntries)
      .set({ status: "cancelled" })
      .where(eq(waitlistEntries.id, entry.id));

    // Renumber positions of entries after this one
    await db
      .update(waitlistEntries)
      .set({ position: entry.position - 1 })
      .where(
        and(
          eq(waitlistEntries.bookingId, bookingId),
          eq(waitlistEntries.status, "waiting"),
          gt(waitlistEntries.position, entry.position)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/portal/group-sessions/[id]/waitlist error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
