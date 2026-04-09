import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { clientPackages, bookings, bookingParticipants } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { requireAdminProvider } from "@/lib/auth-provider";

/**
 * Recalculates sessionsUsed / sessionsRemaining for all client packages
 * belonging to the authenticated provider, based on actual completed/no_show bookings.
 *
 * POST /api/admin/recalculate-packages        — recalculate all packages for provider
 * POST /api/admin/recalculate-packages?clientPackageId=xxx — single package
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { getAdminProviderId } = await import("@/lib/auth-provider");
  const providerId = await getAdminProviderId();
  if (!providerId) return NextResponse.json({ error: "No provider found" }, { status: 403 });

  const singleId = req.nextUrl.searchParams.get("clientPackageId");

  // Fetch packages to recalculate
  const allPackages = await db
    .select()
    .from(clientPackages)
    .where(
      singleId
        ? eq(clientPackages.id, singleId)
        : inArray(
            clientPackages.clientId,
            db
              .select({ id: sql<string>`id` })
              .from(sql`(
                SELECT id FROM clients WHERE provider_id = ${providerId}
              ) AS c`)
          )
    );

  if (allPackages.length === 0) {
    return NextResponse.json({ message: "No packages found", updated: 0 });
  }

  const results = [];

  for (const pkg of allPackages) {
    // Count individual bookings (completed or no_show) linked to this client package
    const [{ individualCount }] = await db
      .select({ individualCount: sql<number>`count(*)`.mapWith(Number) })
      .from(bookings)
      .where(
        and(
          eq(bookings.clientPackageId, pkg.id),
          inArray(bookings.status, ["completed", "no_show"])
        )
      );

    // Count group session participations (completed or no_show parent booking)
    const [{ groupCount }] = await db
      .select({ groupCount: sql<number>`count(*)`.mapWith(Number) })
      .from(bookingParticipants)
      .innerJoin(bookings, eq(bookingParticipants.bookingId, bookings.id))
      .where(
        and(
          eq(bookingParticipants.clientPackageId, pkg.id),
          inArray(bookings.status, ["completed", "no_show"])
        )
      );

    const actualUsed = individualCount + groupCount;
    const newRemaining = Math.max(0, pkg.sessionsTotal - actualUsed);
    const newStatus =
      pkg.status === "refunded"
        ? "refunded"
        : newRemaining <= 0
        ? "exhausted"
        : "active";

    await db
      .update(clientPackages)
      .set({
        sessionsUsed: actualUsed,
        sessionsRemaining: newRemaining,
        status: newStatus,
      })
      .where(eq(clientPackages.id, pkg.id));

    results.push({
      clientPackageId: pkg.id,
      before: { sessionsUsed: pkg.sessionsUsed, sessionsRemaining: pkg.sessionsRemaining },
      after: { sessionsUsed: actualUsed, sessionsRemaining: newRemaining },
    });
  }

  return NextResponse.json({ message: "Recalculated", updated: results.length, results });
}
