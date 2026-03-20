import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { packages, subscriptionPlans, clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripeForProvider } from "@/lib/stripe/provider";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, itemId, clientId, successUrl, cancelUrl } = body;

  if (!type || !itemId || !clientId) {
    return NextResponse.json({ error: "type, itemId, clientId required" }, { status: 400 });
  }

  const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  let stripe;
  try {
    stripe = await getStripeForProvider(client.providerId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const metadata: Record<string, string> = { clientId, type, itemId };

  if (type === "package") {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, itemId));
    if (!pkg?.stripePriceId) return NextResponse.json({ error: "Package has no Stripe price. Link Stripe in Settings first." }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
      customer: client.stripeCustomerId ?? undefined,
      customer_email: client.stripeCustomerId ? undefined : (client.email ?? undefined),
      success_url: successUrl ?? `${base}/clients/${clientId}?payment=success`,
      cancel_url: cancelUrl ?? `${base}/clients/${clientId}`,
      metadata,
    });
    return NextResponse.json({ url: session.url });
  }

  if (type === "subscription") {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, itemId));
    if (!plan?.stripePriceId) return NextResponse.json({ error: "Plan has no Stripe price. Link Stripe in Settings first." }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      customer: client.stripeCustomerId ?? undefined,
      customer_email: client.stripeCustomerId ? undefined : (client.email ?? undefined),
      success_url: successUrl ?? `${base}/clients/${clientId}?payment=success`,
      cancel_url: cancelUrl ?? `${base}/clients/${clientId}`,
      subscription_data: { metadata },
    });
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
