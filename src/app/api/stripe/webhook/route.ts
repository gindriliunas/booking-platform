import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  clientPackages,
  clientSubscriptions,
  clients,
  packages,
  subscriptionPlans,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";


export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { clientId, type, itemId } = session.metadata ?? {};
      if (!clientId || !type || !itemId) break;

      // Update Stripe customer ID on the client
      if (session.customer) {
        await db
          .update(clients)
          .set({ stripeCustomerId: String(session.customer) })
          .where(eq(clients.id, clientId));
      }

      if (type === "package") {
        const [pkg] = await db.select().from(packages).where(eq(packages.id, itemId));
        if (pkg) {
          const expiresAt = pkg.validityDays
            ? new Date(Date.now() + pkg.validityDays * 86400 * 1000)
            : null;

          await db.insert(clientPackages).values({
            clientId,
            packageId: itemId,
            sessionsTotal: pkg.sessionCount,
            sessionsUsed: 0,
            sessionsRemaining: pkg.sessionCount,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: String(session.payment_intent ?? ""),
            expiresAt,
          });
        }
      }

      if (type === "subscription") {
        const [plan] = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, itemId));

        if (plan) {
          const stripeSubId = String(session.subscription ?? "");
          let periodStart: Date | null = null;
          let periodEnd: Date | null = null;

          if (stripeSubId) {
            const sub = await stripe.subscriptions.retrieve(stripeSubId);
            const item = sub.items.data[0];
            if (item) {
              periodStart = new Date(item.current_period_start * 1000);
              periodEnd = new Date(item.current_period_end * 1000);
            }
          }

          await db.insert(clientSubscriptions).values({
            clientId,
            planId: itemId,
            sessionsPerPeriod: plan.sessionsPerPeriod,
            sessionsUsedThisPeriod: 0,
            stripeSubscriptionId: stripeSubId,
            stripeCheckoutSessionId: session.id,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          });
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      // Subscription renewal — reset sessions for the new period
      const invoice = event.data.object as Stripe.Invoice;
      const subDetails = invoice.parent?.subscription_details;
      const stripeSubId = subDetails
        ? (typeof subDetails.subscription === "string"
            ? subDetails.subscription
            : subDetails.subscription?.id)
        : null;
      if (!stripeSubId) break;

      const sub = await stripe.subscriptions.retrieve(stripeSubId);
      const item = sub.items.data[0];
      const periodStart = item ? new Date(item.current_period_start * 1000) : null;
      const periodEnd = item ? new Date(item.current_period_end * 1000) : null;

      await db
        .update(clientSubscriptions)
        .set({
          sessionsUsedThisPeriod: 0,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          status: "active",
        })
        .where(eq(clientSubscriptions.stripeSubscriptionId, stripeSubId));
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db
        .update(clientSubscriptions)
        .set({ status: "cancelled", cancelledAt: new Date() })
        .where(eq(clientSubscriptions.stripeSubscriptionId, sub.id));
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const status = sub.status === "active"
        ? "active"
        : sub.status === "past_due"
        ? "past_due"
        : sub.status === "trialing"
        ? "trialing"
        : "cancelled";

      await db
        .update(clientSubscriptions)
        .set({ status })
        .where(eq(clientSubscriptions.stripeSubscriptionId, sub.id));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
