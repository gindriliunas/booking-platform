import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { adminAuth } from "@/lib/firebase/admin";
import { db } from "@/lib/db";
import { providers, packages, subscriptionPlans, clients, bookings, availability, blockedTimes } from "@/lib/db/schema";
import { eq, and, isNull, ne } from "drizzle-orm";

/**
 * One-time migration: merges the old (pre-Firebase) provider row into the current
 * Firebase-linked provider row by re-parenting all packages from the old row.
 * Safe to call multiple times — idempotent once packages are moved.
 *
 * Also exposes GET to list all providers for debugging.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const firebaseUser = await adminAuth.getUser(session.uid).catch(() => null);

  const allProviders = await db
    .select({
      id: providers.id,
      name: providers.name,
      email: providers.email,
      firebaseUid: providers.firebaseUid,
      createdAt: providers.createdAt,
    })
    .from(providers);

  const pkgCounts = await db
    .select({ providerId: packages.providerId })
    .from(packages);

  const countByProvider: Record<string, number> = {};
  for (const p of pkgCounts) {
    countByProvider[p.providerId] = (countByProvider[p.providerId] ?? 0) + 1;
  }

  return NextResponse.json({
    firebaseEmail: firebaseUser?.email,
    firebaseUid: session.uid,
    providers: allProviders.map((p) => ({
      ...p,
      packageCount: countByProvider[p.id] ?? 0,
      isCurrentSession: p.firebaseUid === session.uid,
    })),
  });
}

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

  // Strategy 1: match by email + no firebaseUid
  let orphanedProviders = email
    ? await db.select().from(providers).where(and(eq(providers.email, email), isNull(providers.firebaseUid)))
    : [];

  // Strategy 2: any provider with no firebaseUid that has packages (broader fallback)
  if (orphanedProviders.length === 0) {
    const allOrphans = await db
      .select()
      .from(providers)
      .where(and(isNull(providers.firebaseUid), ne(providers.id, currentProvider.id)));

    const pkgRows = await db.select({ providerId: packages.providerId }).from(packages);
    const providerIdsWithPkgs = new Set(pkgRows.map((r) => r.providerId));
    orphanedProviders = allOrphans.filter((p) => providerIdsWithPkgs.has(p.id));
  }

  const oldProvider = orphanedProviders.find((p) => p.id !== currentProvider.id);

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
