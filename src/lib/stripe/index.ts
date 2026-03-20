import Stripe from "stripe";

// Lazy singleton — only instantiated when actually called, so missing env var
// doesn't crash the build. Each provider uses their own key stored in the DB;
// this global instance is only used as a fallback / for platform-level calls.
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(key, { apiVersion: "2026-02-25.clover", typescript: true });
  }
  return _stripe;
}

// Keep a named export for backwards compatibility — callers that do
// `stripe.products.create(...)` will now call the getter on first access.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

// Create a Stripe product + price for a session package
export async function createPackageProduct(params: {
  name: string;
  description?: string;
  price: number; // in cents
  currency: string;
  sessionCount: number;
}) {
  const product = await stripe.products.create({
    name: params.name,
    description: params.description,
    metadata: { session_count: String(params.sessionCount), type: "package" },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: params.price,
    currency: params.currency,
  });

  return { product, price };
}

// Create a Stripe product + recurring price for a subscription plan
export async function createSubscriptionProduct(params: {
  name: string;
  description?: string;
  price: number; // in cents
  currency: string;
  sessionsPerPeriod: number;
  billingPeriod: "weekly" | "monthly" | "yearly";
}) {
  const intervalMap = {
    weekly: "week",
    monthly: "month",
    yearly: "year",
  } as const;

  const product = await stripe.products.create({
    name: params.name,
    description: params.description,
    metadata: {
      sessions_per_period: String(params.sessionsPerPeriod),
      type: "subscription",
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: params.price,
    currency: params.currency,
    recurring: { interval: intervalMap[params.billingPeriod] },
  });

  return { product, price };
}

// Create a one-time checkout session for a package purchase
export async function createPackageCheckout(params: {
  stripePriceId: string;
  clientEmail?: string;
  stripeCustomerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: params.stripePriceId, quantity: 1 }],
    customer: params.stripeCustomerId,
    customer_email: params.stripeCustomerId ? undefined : params.clientEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });
}

// Create a subscription checkout session
export async function createSubscriptionCheckout(params: {
  stripePriceId: string;
  clientEmail?: string;
  stripeCustomerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: params.stripePriceId, quantity: 1 }],
    customer: params.stripeCustomerId,
    customer_email: params.stripeCustomerId ? undefined : params.clientEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: { metadata: params.metadata },
  });
}
