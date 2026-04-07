/**
 * Shared waitlist utilities used by both provider-side and portal-side cancel routes.
 */

import { db } from "@/lib/db";
import { waitlistEntries, clients, bookings, providers } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { sendWaitlistSpotAvailableEmail } from "@/lib/email/waitlist";
import { TRIGGERS, fireGhlTrigger, getClientTriggerContext } from "@/lib/ghl/triggers";

type BookingRow = typeof bookings.$inferSelect;

/**
 * Finds the next waiting entry on the waitlist for a session, marks it as
 * "notified", sends an email, and fires the GHL WAITLIST_SPOT_AVAILABLE trigger.
 *
 * Call this after any participant cancellation that frees up a spot.
 * It is intentionally fire-and-forget — errors are caught and logged.
 *
 * @param bookingId - The group session booking ID
 * @param session - Optional pre-fetched booking row (avoids a second DB round-trip)
 */
export async function notifyNextWaitlistEntry(
  bookingId: string,
  session?: BookingRow
): Promise<void> {
  try {
    const [nextEntry] = await db
      .select()
      .from(waitlistEntries)
      .where(
        and(
          eq(waitlistEntries.bookingId, bookingId),
          eq(waitlistEntries.status, "waiting")
        )
      )
      .orderBy(asc(waitlistEntries.position))
      .limit(1);

    if (!nextEntry) return;

    await db
      .update(waitlistEntries)
      .set({ status: "notified", notifiedAt: new Date() })
      .where(eq(waitlistEntries.id, nextEntry.id));

    const [sessionRow] = session
      ? [session]
      : await db.select().from(bookings).where(eq(bookings.id, bookingId));

    const [clientRow] = await db.select().from(clients).where(eq(clients.id, nextEntry.clientId));

    if (clientRow?.email && sessionRow) {
      const [providerRow] = await db
        .select({ name: providers.name })
        .from(providers)
        .where(eq(providers.id, sessionRow.providerId));

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

      await sendWaitlistSpotAvailableEmail({
        clientEmail: clientRow.email,
        clientName: clientRow.name,
        sessionTitle: sessionRow.title ?? "Group Session",
        sessionDate: sessionRow.startTime.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        sessionTime: sessionRow.startTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        providerName: providerRow?.name ?? "",
        claimUrl: `${appUrl}/portal`,
      });
    }

    if (sessionRow) {
      const ctx = await getClientTriggerContext(nextEntry.clientId);
      if (ctx) {
        await fireGhlTrigger(ctx.locationId, ctx.contactId, TRIGGERS.WAITLIST_SPOT_AVAILABLE, {
          bookingId,
          sessionTitle: sessionRow.title ?? "Group Session",
          sessionDate: sessionRow.startTime.toISOString(),
          sessionTime: sessionRow.startTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        });
      }
    }
  } catch (err) {
    console.error("[Waitlist] notifyNextWaitlistEntry failed:", err);
  }
}
