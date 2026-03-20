import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { packages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripeForProvider } from "@/lib/stripe/provider";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  try {
    const rows = await db
      .select()
      .from(packages)
      .where(eq(packages.providerId, providerId))
      .orderBy(packages.sessionCount);

    return NextResponse.json({ packages: rows });
  } catch (err) {
    console.error("GET /api/packages error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { providerId, name, description, sessionCount, sessionDurationMins, price, currency, validityDays, sessionType } = body;

  if (!providerId || !name || !sessionCount || !price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let stripePriceId: string | null = null;
  let stripeProductId: string | null = null;

  try {
    const stripe = await getStripeForProvider(providerId);
    const product = await stripe.products.create({
      name,
      description,
      metadata: { session_count: String(parseInt(sessionCount)), type: "package", session_type: sessionType ?? "individual" },
    });
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(parseFloat(price) * 100),
      currency: currency ?? "usd",
    });
    stripePriceId = stripePrice.id;
    stripeProductId = product.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // If Stripe is not configured, save without it
    if (msg.includes("No Stripe account linked")) {
      // proceed without Stripe IDs
    } else {
      return NextResponse.json({ error: `Stripe error: ${msg}` }, { status: 502 });
    }
  }

  let pkg;
  try {
    [pkg] = await db
      .insert(packages)
      .values({
        providerId,
        name,
        description: description ?? null,
        sessionCount: parseInt(sessionCount),
        sessionDurationMins: sessionDurationMins ? parseInt(sessionDurationMins) : null,
        price: parseFloat(price).toFixed(2),
        currency: currency ?? "usd",
        validityDays: validityDays ? parseInt(validityDays) : null,
        sessionType: sessionType ?? "individual",
        stripePriceId,
        stripeProductId,
      })
      .returning();
  } catch (err) {
    console.error("POST /api/packages db error:", err);
    return NextResponse.json({ error: "Database error — have you run drizzle-kit push?" }, { status: 500 });
  }

  return NextResponse.json({ package: pkg }, { status: 201 });
}
