import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripeForProvider } from "@/lib/stripe/provider";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [client] = await db.select().from(clients).where(eq(clients.firebaseUid, session.uid));
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  if (!client.stripeCustomerId) {
    return NextResponse.json(
      { error: "No payment history found. Make a purchase first to manage payment methods." },
      { status: 400 }
    );
  }

  let stripe;
  try {
    stripe = await getStripeForProvider(client.providerId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const billingSession = await stripe.billingPortal.sessions.create({
    customer: client.stripeCustomerId,
    return_url: `${base}/portal`,
  });

  return NextResponse.json({ url: billingSession.url });
}
