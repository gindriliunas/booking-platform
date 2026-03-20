import { db } from "@/lib/db";
import { availability, bookings, blockedTimes, providers } from "@/lib/db/schema";
import { eq, and, gte, lt, ne } from "drizzle-orm";

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string; // "9:00 AM"
}

function parseHHMM(hhmm: string, baseDate: Date): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

function fmt(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export async function getAvailableSlots(providerId: string, date: Date): Promise<TimeSlot[]> {
  const dayOfWeek = date.getDay();

  // Fetch provider session duration + availability for this day
  const [providerRow] = await db.select().from(providers).where(eq(providers.id, providerId));
  if (!providerRow) return [];

  const dayAvail = await db
    .select()
    .from(availability)
    .where(and(eq(availability.providerId, providerId), eq(availability.dayOfWeek, dayOfWeek)));

  if (dayAvail.length === 0) return []; // not available this day

  const { startTime, endTime } = dayAvail[0];
  const sessionMins = providerRow.sessionDurationMins ?? 60;

  // Day boundaries
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Fetch existing bookings and blocked times for the day
  const [existingBookings, existingBlocks] = await Promise.all([
    db
      .select({ startTime: bookings.startTime, endTime: bookings.endTime })
      .from(bookings)
      .where(and(
        eq(bookings.providerId, providerId),
        gte(bookings.startTime, dayStart),
        lt(bookings.startTime, dayEnd),
        ne(bookings.sessionType, "group"), // group sessions don't consume individual slots
      )),
    db
      .select({ startTime: blockedTimes.startTime, endTime: blockedTimes.endTime })
      .from(blockedTimes)
      .where(and(eq(blockedTimes.providerId, providerId), gte(blockedTimes.startTime, dayStart), lt(blockedTimes.startTime, dayEnd))),
  ]);

  const busy = [...existingBookings, ...existingBlocks];

  // Generate slots
  const slots: TimeSlot[] = [];
  let cursor = parseHHMM(startTime, date);
  const windowEnd = parseHHMM(endTime, date);
  const now = new Date();

  while (cursor < windowEnd) {
    const slotEnd = new Date(cursor.getTime() + sessionMins * 60 * 1000);
    if (slotEnd > windowEnd) break;

    const isBooked = busy.some((b) => overlaps(cursor, slotEnd, new Date(b.startTime), new Date(b.endTime)));
    const isPast = slotEnd <= now;

    if (!isBooked && !isPast) {
      slots.push({ start: new Date(cursor), end: slotEnd, label: fmt(cursor) });
    }

    cursor = new Date(cursor.getTime() + sessionMins * 60 * 1000);
  }

  return slots;
}
