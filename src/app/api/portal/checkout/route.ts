import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { packages, clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripeForProvider } from "@/lib/stripe/provider";
import { getPortalClient } from "@/lib/portal";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getPortalClient(userId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const body = await req.json();
  const { type, itemId } = body;

  if (!type || !itemId) {
    return NextResponse.json({ error: "type and itemId required" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = await getStripeForProvider(client.providerId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const metadata: Record<string, string> = { clientId: client.id, type, itemId };

  if (type === "package") {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, itemId));
    if (!pkg?.stripePriceId) {
      return NextResponse.json(
        { error: "Package has no Stripe price. Contact your provider." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
      customer: client.stripeCustomerId ?? undefined,
      customer_email: client.stripeCustomerId ? undefined : (client.email ?? undefined),
      success_url: `${base}/portal/packages?payment=success`,
      cancel_url: `${base}/portal/packages`,
      metadata,
    });
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
