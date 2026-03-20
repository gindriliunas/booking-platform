import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, packages, subscriptionPlans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getStripeForProvider } from "@/lib/stripe/provider";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { providerId, type, itemId, clientName, clientEmail } = body;

  if (!providerId || !type || !itemId || !clientName || !clientEmail) {
    return NextResponse.json(
      { error: "providerId, type, itemId, clientName, clientEmail required" },
      { status: 400 }
    );
  }

  if (type !== "package" && type !== "subscription") {
    return NextResponse.json({ error: "type must be 'package' or 'subscription'" }, { status: 400 });
  }

  // Find or create client by email + providerId
  let [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.providerId, providerId), eq(clients.email, clientEmail)));

  if (!client) {
    [client] = await db
      .insert(clients)
      .values({
        providerId,
        name: clientName,
        email: clientEmail,
        ghlContactId: `pay_link_${Date.now()}`,
      })
      .returning();
  }

  let stripe;
  try {
    stripe = await getStripeForProvider(providerId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const successUrl = `${base}/pay/success`;
  const cancelUrl = `${base}/pay/${providerId}/${type}/${itemId}`;
  const metadata: Record<string, string> = { clientId: client.id, type, itemId };

  if (type === "package") {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, itemId));
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    if (!pkg.stripePriceId) {
      return NextResponse.json(
        { error: "This package is not available for online purchase yet. Please contact the provider directly." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
      customer: client.stripeCustomerId ?? undefined,
      customer_email: client.stripeCustomerId ? undefined : clientEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    return NextResponse.json({ url: session.url });
  }

  // type === "subscription"
  const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, itemId));
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  if (!plan.stripePriceId) {
    return NextResponse.json(
      { error: "This plan is not available for online purchase yet. Please contact the provider directly." },
      { status: 400 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    customer: client.stripeCustomerId ?? undefined,
    customer_email: client.stripeCustomerId ? undefined : clientEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: { metadata },
  });
  return NextResponse.json({ url: session.url });
}
