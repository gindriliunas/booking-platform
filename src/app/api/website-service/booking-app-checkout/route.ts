import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.vivz.co.uk";
  const PRICE_ID = process.env.BOOKING_APP_STRIPE_PRICE_ID!;

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const [client] = await db
      .select()
      .from(websiteClients)
      .where(eq(websiteClients.email, email.toLowerCase().trim()));

    if (!client) {
      return NextResponse.json(
        { error: "No website subscription found for this email address." },
        { status: 404 },
      );
    }

    if (client.status !== "active") {
      return NextResponse.json(
        { error: "Your website subscription is not active yet. Please activate it first." },
        { status: 400 },
      );
    }

    if (client.bookingAppEnabled) {
      return NextResponse.json(
        { error: "The Bookings App is already enabled on your account." },
        { status: 400 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: client.stripeCustomerId ?? undefined,
      customer_email: client.stripeCustomerId ? undefined : client.email,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/booking-app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/booking-app`,
      metadata: {
        websiteClientId: client.id,
        type: "booking_app",
      },
      subscription_data: {
        metadata: {
          websiteClientId: client.id,
          type: "booking_app",
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/website-service/booking-app-checkout error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
