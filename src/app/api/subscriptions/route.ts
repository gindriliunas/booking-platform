import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptionPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripeForProvider } from "@/lib/stripe/provider";
import { requireAdminProvider } from "@/lib/auth-provider";

const intervalMap = { weekly: "week", monthly: "month", yearly: "year" } as const;

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  try {
    const rows = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.providerId, providerId));

    return NextResponse.json({ plans: rows });
  } catch (err) {
    console.error("GET /api/subscriptions error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { providerId, name, description, sessionsPerPeriod, sessionDurationMins, billingPeriod, price, currency, sessionType, isPublic } = body;

  if (!providerId || !name || !sessionsPerPeriod || !price || !billingPeriod) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  let stripePriceId: string | null = null;
  let stripeProductId: string | null = null;

  try {
    const stripe = await getStripeForProvider(providerId);
    const product = await stripe.products.create({
      name,
      description,
      metadata: { sessions_per_period: String(parseInt(sessionsPerPeriod)), type: "subscription", session_type: sessionType ?? "individual" },
    });
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(parseFloat(price) * 100),
      currency: currency ?? "usd",
      recurring: { interval: intervalMap[billingPeriod as keyof typeof intervalMap] },
    });
    stripePriceId = stripePrice.id;
    stripeProductId = product.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("No Stripe account linked")) {
      // proceed without Stripe IDs
    } else {
      return NextResponse.json({ error: `Stripe error: ${msg}` }, { status: 502 });
    }
  }

  let plan;
  try {
    [plan] = await db
      .insert(subscriptionPlans)
      .values({
        providerId,
        name,
        description: description ?? null,
        sessionsPerPeriod: parseInt(sessionsPerPeriod),
        sessionDurationMins: sessionDurationMins ? parseInt(sessionDurationMins) : null,
        billingPeriod,
        price: parseFloat(price).toFixed(2),
        currency: currency ?? "usd",
        sessionType: sessionType ?? "individual",
        isPublic: isPublic ?? true,
        stripePriceId,
        stripeProductId,
      })
      .returning();
  } catch (err) {
    console.error("POST /api/subscriptions db error:", err);
    return NextResponse.json({ error: "Database error — have you run drizzle-kit push?" }, { status: 500 });
  }

  return NextResponse.json({ plan }, { status: 201 });
}
