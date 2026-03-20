import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, blockedTimes, clients, clientPackages, clientSubscriptions } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { requireAdminProvider } from "@/lib/auth-provider";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  const [bookingRows, blockedRows] = await Promise.all([
    db.query.bookings.findMany({
      where: eq(bookings.providerId, providerId),
      with: {
        client: true,
        participants: {
          where: (p, { eq }) => eq(p.status, "booked"),
          with: { client: true },
        },
      },
      orderBy: (b, { asc }) => [asc(b.startTime)],
    }),
    db
      .select()
      .from(blockedTimes)
      .where(eq(blockedTimes.providerId, providerId)),
  ]);

  return NextResponse.json({ bookings: bookingRows, blockedTimes: blockedRows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { providerId, clientId, title, startTime, endTime, status, notes, clientPackageId, sessionType, maxParticipants } = body;

  if (!providerId || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  // Group session validation
  if (sessionType === "group") {
    if (!maxParticipants || parseInt(maxParticipants) < 2) {
      return NextResponse.json({ error: "Group sessions require maxParticipants of at least 2" }, { status: 400 });
    }
  }

  // Deduct from package if specified (individual sessions only)
  if (clientPackageId) {
    const [pkg] = await db
      .select()
      .from(clientPackages)
      .where(eq(clientPackages.id, clientPackageId));

    if (!pkg || pkg.sessionsRemaining <= 0) {
      return NextResponse.json({ error: "No sessions remaining in this package" }, { status: 400 });
    }

    await db
      .update(clientPackages)
      .set({
        sessionsUsed: pkg.sessionsUsed + 1,
        sessionsRemaining: pkg.sessionsRemaining - 1,
        status: pkg.sessionsRemaining - 1 <= 0 ? "exhausted" : "active",
      })
      .where(eq(clientPackages.id, clientPackageId));
  }

  const [booking] = await db
    .insert(bookings)
    .values({
      providerId,
      clientId: sessionType === "group" ? null : (clientId ?? null),
      title: title ?? (sessionType === "group" ? "Group Session" : "Session"),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: status ?? "scheduled",
      notes: notes ?? null,
      clientPackageId: sessionType === "group" ? null : (clientPackageId ?? null),
      sessionSource: clientPackageId && sessionType !== "group" ? "package" : "single",
      sessionType: sessionType ?? "individual",
      maxParticipants: sessionType === "group" ? parseInt(maxParticipants) : null,
    })
    .returning();

  return NextResponse.json({ booking }, { status: 201 });
}
