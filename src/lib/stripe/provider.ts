import Stripe from "stripe";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Returns a Stripe instance configured with the provider's stored secret key.
 * Falls back to the STRIPE_SECRET_KEY env var if none is stored.
 * Throws if neither is available.
 */
export async function getStripeForProvider(providerId: string): Promise<Stripe> {
  const [provider] = await db
    .select({ stripeSecretKey: providers.stripeSecretKey })
    .from(providers)
    .where(eq(providers.id, providerId));

  const key = provider?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_placeholder") {
    throw new Error("No Stripe account linked. Go to Settings → Stripe to add your secret key.");
  }

  return new Stripe(key, { apiVersion: "2026-02-25.clover", typescript: true });
}

/**
 * Returns the webhook secret for the provider, falling back to env var.
 */
export async function getWebhookSecretForProvider(providerId: string): Promise<string> {
  const [provider] = await db
    .select({ stripeWebhookSecret: providers.stripeWebhookSecret })
    .from(providers)
    .where(eq(providers.id, providerId));

  return provider?.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET || "";
}

/**
 * Returns whether a provider has Stripe configured.
 */
export async function hasStripeConfigured(providerId: string): Promise<boolean> {
  const [provider] = await db
    .select({ stripeSecretKey: providers.stripeSecretKey })
    .from(providers)
    .where(eq(providers.id, providerId));

  const key = provider?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
  return !!key && key !== "sk_test_placeholder";
}
