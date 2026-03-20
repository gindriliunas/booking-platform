/**
 * GHL Marketplace Custom Triggers
 *
 * Each trigger fires an event that GHL Workflow Builder can react to.
 * Providers configure their own automations (email, SMS, etc.) in GHL
 * using the trigger keys defined here.
 *
 * All public functions are fire-and-forget — wrap calls in
 * (async () => { ... })().catch(console.error) to avoid blocking responses.
 */

import { db } from "@/lib/db";
import { clients, clientPackages, packages, providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ghlFetch } from "./client";
import { getValidToken } from "./tokens";

// ─── Trigger Keys ────────────────────────────────────────────────────────────

export const TRIGGERS = {
  SESSION_BOOKED:       "session_booked",
  SESSION_CANCELLED:    "session_cancelled",
  SESSION_COMPLETED:    "session_completed",
  SESSION_REMINDER_24H: "session_reminder_24h",
  SESSION_REMINDER_1H:  "session_reminder_1h",
  SESSIONS_UPDATED:     "sessions_updated",
  PACKAGE_PURCHASED:    "package_purchased",
  SUBSCRIPTION_RENEWED: "subscription_renewed",
} as const;

export type TriggerKey = typeof TRIGGERS[keyof typeof TRIGGERS];

// ─── Custom Data Shapes ───────────────────────────────────────────────────────

export interface SessionTriggerData {
  bookingId: string;
  sessionDate: string;   // ISO string
  sessionTime: string;   // human-readable e.g. "2:00 PM"
  sessionDurationMins: number;
  providerName: string;
}

export interface SessionsUpdatedData {
  sessionsRemaining: number;
  sessionsTotal: number;
  packageName: string;
}

export interface PackagePurchasedData {
  packageName: string;
  sessionsTotal: number;
  expiresAt: string | null;
}

export interface SubscriptionRenewedData {
  planName: string;
  sessionsPerPeriod: number;
  periodEnd: string;
}

// ─── Core Fire Function ───────────────────────────────────────────────────────

export async function fireGhlTrigger(
  locationId: string,
  contactId: string,
  triggerKey: TriggerKey,
  customData: Record<string, unknown>
): Promise<void> {
  const appId = process.env.GHL_APP_ID;
  if (!appId) {
    console.warn("[GHL Trigger] GHL_APP_ID not set — skipping", triggerKey);
    return;
  }

  const token = await getValidToken(locationId);

  await ghlFetch(
    `/custom-providers/api/triggers/${appId}/notify`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ contactId, customData }),
    }
  );
}

// ─── Location Resolution Helper ───────────────────────────────────────────────

/**
 * Resolve the GHL locationId for a given providerId.
 * Returns null if the provider has no installation.
 */
export async function getLocationIdForProvider(providerId: string): Promise<string | null> {
  const provider = await db.query.providers.findFirst({
    where: eq(providers.id, providerId),
    with: { installation: true },
  });
  return provider?.installation?.locationId ?? null;
}

/**
 * Resolve ghlContactId and locationId for a clientId.
 * Returns null for either if not found or not set.
 */
export async function getClientTriggerContext(
  clientId: string
): Promise<{ contactId: string; locationId: string } | null> {
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
    with: { provider: { with: { installation: true } } },
  });

  const contactId = client?.ghlContactId;
  const locationId = client?.provider?.installation?.locationId;

  if (!contactId || !locationId) return null;
  return { contactId, locationId };
}

// ─── Sessions Updated Helper ──────────────────────────────────────────────────

/**
 * After any session deduction, fire `sessions_updated` with the current
 * remaining count. GHL workflow conditions decide what to do (e.g. send
 * email when sessionsRemaining = 2).
 */
export async function fireSessionsUpdatedTrigger(clientPackageId: string): Promise<void> {
  const pkg = await db.query.clientPackages.findFirst({
    where: eq(clientPackages.id, clientPackageId),
    with: {
      client: { with: { provider: { with: { installation: true } } } },
      package: true,
    },
  });

  if (!pkg) return;

  const contactId = pkg.client?.ghlContactId;
  const locationId = pkg.client?.provider?.installation?.locationId;
  if (!contactId || !locationId) return;

  await fireGhlTrigger(locationId, contactId, TRIGGERS.SESSIONS_UPDATED, {
    sessionsRemaining: pkg.sessionsRemaining,
    sessionsTotal: pkg.sessionsTotal,
    packageName: pkg.package?.name ?? "Package",
  } satisfies SessionsUpdatedData);
}
