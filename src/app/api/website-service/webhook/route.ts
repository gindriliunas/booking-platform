import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { sendDomainSetupEmail } from "@/lib/email/website-service";
import { suspendVercelProject, activateVercelProject } from "@/lib/vercel-api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBSITE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientId = session.metadata?.websiteClientId;
        if (!clientId) break;

        // Booking app addon checkout
        if (session.metadata?.type === "booking_app") {
          await db
            .update(websiteClients)
            .set({
              bookingAppEnabled: true,
              bookingAppStripeSubscriptionId: session.subscription as string,
              updatedAt: new Date(),
            })
            .where(eq(websiteClients.id, clientId));
          break;
        }

        // Standard website subscription checkout
        const [client] = await db
          .update(websiteClients)
          .set({
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            stripeCheckoutSessionId: session.id,
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(websiteClients.id, clientId))
          .returning();

        if (client?.vercelProjectId) {
          await activateVercelProject(client.vercelProjectId).catch(console.error);
        }

        if (client) {
          sendDomainSetupEmail({
            clientEmail: client.email,
            clientName: client.name,
            businessName: client.businessName,
            websiteClientId: client.id,
          }).catch(console.error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clientId = sub.metadata?.websiteClientId;
        if (!clientId) break;

        const [client] = await db
          .update(websiteClients)
          .set({ status: "suspended", updatedAt: new Date() })
          .where(eq(websiteClients.id, clientId))
          .returning();

        if (client?.vercelProjectId) {
          await suspendVercelProject(client.vercelProjectId).catch(console.error);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const clientId = sub.metadata?.websiteClientId;
        if (!clientId) break;

        if (sub.status === "active" || sub.status === "trialing") {
          const [client] = await db
            .update(websiteClients)
            .set({ status: "active", updatedAt: new Date() })
            .where(eq(websiteClients.id, clientId))
            .returning();

          if (client?.vercelProjectId) {
            await activateVercelProject(client.vercelProjectId).catch(console.error);
          }
        } else if (sub.status === "past_due" || sub.status === "unpaid") {
          const [client] = await db
            .update(websiteClients)
            .set({ status: "suspended", updatedAt: new Date() })
            .where(eq(websiteClients.id, clientId))
            .returning();

          if (client?.vercelProjectId) {
            await suspendVercelProject(client.vercelProjectId).catch(console.error);
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
