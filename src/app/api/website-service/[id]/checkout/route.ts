import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.vivz.co.uk";
const PRICE_ID = process.env.WEBSITE_SERVICE_STRIPE_PRICE_ID!;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [client] = await db
      .select()
      .from(websiteClients)
      .where(eq(websiteClients.id, id));

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.status === "active") {
      return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: client.email,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/website-activate/${client.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: client.previewUrl ?? `${APP_URL}/website-activate/${client.id}`,
      metadata: { websiteClientId: client.id },
      subscription_data: { metadata: { websiteClientId: client.id } },
    });

    await db
      .update(websiteClients)
      .set({ stripeCheckoutSessionId: session.id, updatedAt: new Date() })
      .where(eq(websiteClients.id, client.id));

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/website-service/[id]/checkout error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
