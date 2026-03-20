import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, reminderLogs } from "@/lib/db/schema";
import { and, between, eq, isNotNull } from "drizzle-orm";
import {
  TRIGGERS,
  fireGhlTrigger,
  getClientTriggerContext,
} from "@/lib/ghl/triggers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 24h window: ±5 min around the 24h mark
  const w24Start = new Date(now.getTime() + 23 * 3600_000 + 55 * 60_000);
  const w24End   = new Date(now.getTime() + 24 * 3600_000 +  5 * 60_000);

  // 1h window: ±5 min around the 1h mark
  const w1hStart = new Date(now.getTime() + 55 * 60_000);
  const w1hEnd   = new Date(now.getTime() + 65 * 60_000);

  const [bookings24h, bookings1h] = await Promise.all([
    db.query.bookings.findMany({
      where: and(
        eq(bookings.status, "scheduled"),
        isNotNull(bookings.clientId),
        between(bookings.startTime, w24Start, w24End)
      ),
      with: { client: { with: { provider: { with: { installation: true } } } } },
    }),
    db.query.bookings.findMany({
      where: and(
        eq(bookings.status, "scheduled"),
        isNotNull(bookings.clientId),
        between(bookings.startTime, w1hStart, w1hEnd)
      ),
      with: { client: { with: { provider: { with: { installation: true } } } } },
    }),
  ]);

  let fired24h = 0;
  let fired1h = 0;

  for (const booking of bookings24h) {
    try {
      if (!booking.clientId || !booking.client?.ghlContactId) continue;
      const locationId = booking.client?.provider?.installation?.locationId;
      if (!locationId) continue;

      // Dedup: insert returns nothing if row already exists
      const [inserted] = await db
        .insert(reminderLogs)
        .values({ bookingId: booking.id, reminderType: "24h" })
        .onConflictDoNothing()
        .returning();

      if (!inserted) continue; // already sent

      const durationMins = Math.round(
        (booking.endTime.getTime() - booking.startTime.getTime()) / 60000
      );

      await fireGhlTrigger(locationId, booking.client.ghlContactId, TRIGGERS.SESSION_REMINDER_24H, {
        bookingId: booking.id,
        sessionDate: booking.startTime.toISOString(),
        sessionTime: booking.startTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        sessionDurationMins: durationMins,
        providerName: booking.client?.provider?.name ?? "",
      });

      fired24h++;
    } catch (err) {
      console.error(`[Cron] 24h reminder failed for booking ${booking.id}:`, err);
    }
  }

  for (const booking of bookings1h) {
    try {
      if (!booking.clientId || !booking.client?.ghlContactId) continue;
      const locationId = booking.client?.provider?.installation?.locationId;
      if (!locationId) continue;

      const [inserted] = await db
        .insert(reminderLogs)
        .values({ bookingId: booking.id, reminderType: "1h" })
        .onConflictDoNothing()
        .returning();

      if (!inserted) continue;

      const durationMins = Math.round(
        (booking.endTime.getTime() - booking.startTime.getTime()) / 60000
      );

      await fireGhlTrigger(locationId, booking.client.ghlContactId, TRIGGERS.SESSION_REMINDER_1H, {
        bookingId: booking.id,
        sessionDate: booking.startTime.toISOString(),
        sessionTime: booking.startTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        sessionDurationMins: durationMins,
        providerName: booking.client?.provider?.name ?? "",
      });

      fired1h++;
    } catch (err) {
      console.error(`[Cron] 1h reminder failed for booking ${booking.id}:`, err);
    }
  }

  return NextResponse.json({ fired24h, fired1h, timestamp: now.toISOString() });
}
