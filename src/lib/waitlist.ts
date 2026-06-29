import { db } from "@/lib/db";
import { waitlistEntries, clients, bookings, providers } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { sendWaitlistSpotAvailableEmail } from "@/lib/email/waitlist";

type BookingRow = typeof bookings.$inferSelect;

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

      const emailResult = await sendWaitlistSpotAvailableEmail({
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

      if (!emailResult.ok) {
        console.warn("[Waitlist] Notification email skipped:", emailResult.reason);
        return;
      }
    }

    await db
      .update(waitlistEntries)
      .set({ status: "notified", notifiedAt: new Date() })
      .where(eq(waitlistEntries.id, nextEntry.id));
  } catch (err) {
    console.error("[Waitlist] notifyNextWaitlistEntry failed:", err);
  }
}
