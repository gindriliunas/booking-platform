/**
 * Late cancellation policy helper.
 *
 * When a client cancels a booking within the provider's configured window,
 * either their session credit is forfeited or a Stripe charge is attempted.
 *
 * Provider-side cancellations are always exempt (isPortalCancel = false).
 */

import { differenceInHours } from "date-fns";
import { db } from "@/lib/db";
import {
  providers,
  clients,
  clientPackages,
  clientSubscriptions,
  lateCancellationLogs,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripeForProvider } from "@/lib/stripe/provider";

export type LateCancelOutcome =
  | "deducted"
  | "charged"
  | "charge_failed"
  | "requires_collection"
  | "waived";

export interface LateCancelResult {
  isLate: boolean;
  action: "deduct_session" | "charge" | null;
  outcome: LateCancelOutcome | null;
  shouldRestoreSession: boolean;
}

interface Params {
  bookingId: string;
  clientId: string;
  providerId: string;
  sessionStartTime: Date;
  clientPackageId: string | null | undefined;
  clientSubscriptionId: string | null | undefined;
  /** false = provider-initiated cancel → always exempt from penalty */
  isPortalCancel: boolean;
}

export async function checkAndApplyLateCancelPolicy(
  params: Params
): Promise<LateCancelResult> {
  const { bookingId, clientId, providerId, sessionStartTime, isPortalCancel } = params;

  // Provider-initiated cancels are always exempt
  if (!isPortalCancel) {
    return { isLate: false, action: null, outcome: null, shouldRestoreSession: true };
  }

  const [provider] = await db
    .select({
      lateCancelWindowHours: providers.lateCancelWindowHours,
      lateCancelAction: providers.lateCancelAction,
      lateCancelChargeAmount: providers.lateCancelChargeAmount,
      currency: providers.currency,
    })
    .from(providers)
    .where(eq(providers.id, providerId));

  if (!provider?.lateCancelWindowHours || !provider.lateCancelAction) {
    return { isLate: false, action: null, outcome: null, shouldRestoreSession: true };
  }

  const hoursUntil = differenceInHours(sessionStartTime, new Date());
  if (hoursUntil >= provider.lateCancelWindowHours) {
    return { isLate: false, action: null, outcome: null, shouldRestoreSession: true };
  }

  // It's a late cancel
  const action = provider.lateCancelAction as "deduct_session" | "charge";

  if (action === "deduct_session") {
    await db.insert(lateCancellationLogs).values({
      bookingId,
      clientId,
      providerId,
      sessionStartTime,
      windowHours: provider.lateCancelWindowHours,
      action,
      outcome: "deducted",
    });
    return { isLate: true, action, outcome: "deducted", shouldRestoreSession: false };
  }

  // action === "charge"
  let outcome: LateCancelOutcome = "requires_collection";
  let stripePaymentIntentId: string | undefined;
  const chargeAmountCents = provider.lateCancelChargeAmount
    ? Math.round(parseFloat(provider.lateCancelChargeAmount) * 100)
    : 0;

  if (chargeAmountCents > 0) {
    try {
      const stripe = await getStripeForProvider(providerId);

      const [clientRow] = await db
        .select({ stripeCustomerId: clients.stripeCustomerId })
        .from(clients)
        .where(eq(clients.id, clientId));

      if (clientRow?.stripeCustomerId) {
        // Fetch default payment method
        const customer = await stripe.customers.retrieve(clientRow.stripeCustomerId) as import("stripe").Stripe.Customer;
        const paymentMethod =
          typeof customer.invoice_settings?.default_payment_method === "string"
            ? customer.invoice_settings.default_payment_method
            : null;

        if (paymentMethod) {
          const pi = await stripe.paymentIntents.create({
            amount: chargeAmountCents,
            currency: provider.currency,
            customer: clientRow.stripeCustomerId,
            payment_method: paymentMethod,
            confirm: true,
            off_session: true,
            description: "Late cancellation fee",
            metadata: { bookingId, clientId },
          });
          stripePaymentIntentId = pi.id;
          outcome = pi.status === "succeeded" ? "charged" : "charge_failed";
        } else {
          outcome = "requires_collection";
        }
      } else {
        outcome = "requires_collection";
      }
    } catch {
      outcome = "charge_failed";
    }
  }

  await db.insert(lateCancellationLogs).values({
    bookingId,
    clientId,
    providerId,
    sessionStartTime,
    windowHours: provider.lateCancelWindowHours,
    action,
    outcome,
    stripePaymentIntentId,
    chargeAmountCents: chargeAmountCents || null,
    notes:
      outcome === "requires_collection"
        ? "No Stripe payment method on file — manual collection required"
        : undefined,
  });

  // For charge action: always restore session (the charge is the penalty)
  return { isLate: true, action, outcome, shouldRestoreSession: true };
}
