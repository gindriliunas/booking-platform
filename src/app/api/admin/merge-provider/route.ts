import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { adminAuth } from "@/lib/firebase/admin";
import { db } from "@/lib/db";
import { providers, packages, subscriptionPlans, clients, bookings, availability, blockedTimes } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

/**
 * One-time migration: merges the old (pre-Firebase) provider row into the current
 * Firebase-linked provider row by re-parenting all packages from the old row.
 * Safe to call multiple times — idempotent once packages are moved.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Current (Firebase-linked) provider
  const [currentProvider] = await db
    .select()
    .from(providers)
    .where(eq(providers.firebaseUid, session.uid));

  if (!currentProvider) {
    return NextResponse.json({ error: "No Firebase-linked provider found for this session" }, { status: 404 });
  }

  // Find the email for this Firebase user
  const firebaseUser = await adminAuth.getUser(session.uid).catch(() => null);
  const email = firebaseUser?.email;
  if (!email) {
    return NextResponse.json({ error: "Could not resolve email from Firebase user" }, { status: 400 });
  }

  // Find the OLD provider: same email, no firebaseUid, different id
  const oldProviders = await db
    .select()
    .from(providers)
    .where(and(eq(providers.email, email), isNull(providers.firebaseUid)));

  const oldProvider = oldProviders.find((p) => p.id !== currentProvider.id);

  if (!oldProvider) {
    return NextResponse.json({
      message: "No orphaned provider found — nothing to merge.",
      currentProviderId: currentProvider.id,
    });
  }

  // Move packages
  const movedPkgs = await db
    .update(packages)
    .set({ providerId: currentProvider.id })
    .where(eq(packages.providerId, oldProvider.id))
    .returning({ id: packages.id });

  // Move subscription plans
  const movedPlans = await db
    .update(subscriptionPlans)
    .set({ providerId: currentProvider.id })
    .where(eq(subscriptionPlans.providerId, oldProvider.id))
    .returning({ id: subscriptionPlans.id });

  // Move clients
  const movedClients = await db
    .update(clients)
    .set({ providerId: currentProvider.id })
    .where(eq(clients.providerId, oldProvider.id))
    .returning({ id: clients.id });

  // Move bookings
  const movedBookings = await db
    .update(bookings)
    .set({ providerId: currentProvider.id })
    .where(eq(bookings.providerId, oldProvider.id))
    .returning({ id: bookings.id });

  // Move availability
  await db
    .update(availability)
    .set({ providerId: currentProvider.id })
    .where(eq(availability.providerId, oldProvider.id));

  // Move blocked times
  await db
    .update(blockedTimes)
    .set({ providerId: currentProvider.id })
    .where(eq(blockedTimes.providerId, oldProvider.id));

  // Copy over any settings from old provider that current one is missing
  const updates: Record<string, unknown> = {};
  if (!currentProvider.stripeSecretKey && oldProvider.stripeSecretKey)
    updates.stripeSecretKey = oldProvider.stripeSecretKey;
  if (!currentProvider.stripeWebhookSecret && oldProvider.stripeWebhookSecret)
    updates.stripeWebhookSecret = oldProvider.stripeWebhookSecret;
  if (!currentProvider.stripeAccountId && oldProvider.stripeAccountId)
    updates.stripeAccountId = oldProvider.stripeAccountId;
  if (!currentProvider.googleCalendarAccessToken && oldProvider.googleCalendarAccessToken) {
    updates.googleCalendarAccessToken = oldProvider.googleCalendarAccessToken;
    updates.googleCalendarRefreshToken = oldProvider.googleCalendarRefreshToken;
    updates.googleCalendarTokenExpiresAt = oldProvider.googleCalendarTokenExpiresAt;
    updates.googleCalendarId = oldProvider.googleCalendarId;
    updates.googleCalendarSyncEnabled = oldProvider.googleCalendarSyncEnabled;
  }

  if (Object.keys(updates).length > 0) {
    await db.update(providers).set(updates).where(eq(providers.id, currentProvider.id));
  }

  // Delete the old provider (now empty)
  await db.delete(providers).where(eq(providers.id, oldProvider.id));

  return NextResponse.json({
    message: "Merge complete",
    oldProviderId: oldProvider.id,
    currentProviderId: currentProvider.id,
    moved: {
      packages: movedPkgs.length,
      subscriptionPlans: movedPlans.length,
      clients: movedClients.length,
      bookings: movedBookings.length,
    },
  });
}
