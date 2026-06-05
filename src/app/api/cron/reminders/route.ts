import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, reminderLogs } from "@/lib/db/schema";
import { and, between, eq, isNotNull } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const w24Start = new Date(now.getTime() + 23 * 3600_000 + 55 * 60_000);
  const w24End = new Date(now.getTime() + 24 * 3600_000 + 5 * 60_000);
  const w1hStart = new Date(now.getTime() + 55 * 60_000);
  const w1hEnd = new Date(now.getTime() + 65 * 60_000);

  const [bookings24h, bookings1h] = await Promise.all([
    db.query.bookings.findMany({
      where: and(
        eq(bookings.status, "scheduled"),
        isNotNull(bookings.clientId),
        between(bookings.startTime, w24Start, w24End)
      ),
      with: { client: { with: { provider: true } } },
    }),
    db.query.bookings.findMany({
      where: and(
        eq(bookings.status, "scheduled"),
        isNotNull(bookings.clientId),
        between(bookings.startTime, w1hStart, w1hEnd)
      ),
      with: { client: { with: { provider: true } } },
    }),
  ]);

  let fired24h = 0;
  let fired1h = 0;

  for (const booking of bookings24h) {
    try {
      if (!booking.clientId || !booking.client?.email) continue;

      const [inserted] = await db
        .insert(reminderLogs)
        .values({ bookingId: booking.id, reminderType: "24h" })
        .onConflictDoNothing()
        .returning();

      if (!inserted) continue;

      console.info(
        `[Cron] 24h reminder queued for booking ${booking.id} → ${booking.client.email}`
      );
      fired24h++;
    } catch (err) {
      console.error(`[Cron] 24h reminder failed for booking ${booking.id}:`, err);
    }
  }

  for (const booking of bookings1h) {
    try {
      if (!booking.clientId || !booking.client?.email) continue;

      const [inserted] = await db
        .insert(reminderLogs)
        .values({ bookingId: booking.id, reminderType: "1h" })
        .onConflictDoNothing()
        .returning();

      if (!inserted) continue;

      console.info(
        `[Cron] 1h reminder queued for booking ${booking.id} → ${booking.client.email}`
      );
      fired1h++;
    } catch (err) {
      console.error(`[Cron] 1h reminder failed for booking ${booking.id}:`, err);
    }
  }

  return NextResponse.json({ fired24h, fired1h, timestamp: now.toISOString() });
}
