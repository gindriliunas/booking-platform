import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { packages, clientPackages } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getStripeForProvider } from "@/lib/stripe/provider";
import { getPortalClient } from "@/lib/portal";
import {
  TRIGGERS,
  fireGhlTrigger,
  getClientTriggerContext,
} from "@/lib/ghl/triggers";

function isNoCostPackage(pkg: { price: string; isFreeTrialSession: boolean }) {
  return pkg.isFreeTrialSession || parseFloat(pkg.price) === 0;
}

export async function POST(req: NextRequest) {
  const authSession = await getSession();
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getPortalClient(authSession.uid);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const body = await req.json();
  const { type, itemId } = body;

  if (!type || !itemId) {
    return NextResponse.json({ error: "type and itemId required" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const successUrl = `${base}/portal/packages?payment=success`;
  const metadata: Record<string, string> = { clientId: client.id, type, itemId };

  if (type === "package") {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, itemId));
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    if (pkg.providerId !== client.providerId) {
      return NextResponse.json({ error: "Invalid package" }, { status: 403 });
    }
    if (!pkg.isActive || !pkg.isPublic) {
      return NextResponse.json({ error: "This package is not available for purchase." }, { status: 400 });
    }

    if (isNoCostPackage(pkg)) {
      const [existing] = await db
        .select({ id: clientPackages.id })
        .from(clientPackages)
        .where(and(eq(clientPackages.clientId, client.id), eq(clientPackages.packageId, pkg.id)))
        .limit(1);
      if (existing) {
        return NextResponse.json(
          { error: "You already have this package." },
          { status: 409 }
        );
      }

      const expiresAt = pkg.validityDays
        ? new Date(Date.now() + pkg.validityDays * 86400 * 1000)
        : null;

      await db.insert(clientPackages).values({
        clientId: client.id,
        packageId: pkg.id,
        sessionsTotal: pkg.sessionCount,
        sessionsUsed: 0,
        sessionsRemaining: pkg.sessionCount,
        stripeCheckoutSessionId: null,
        stripePaymentIntentId: null,
        expiresAt,
      });

      (async () => {
        try {
          const ctx = await getClientTriggerContext(client.id);
          if (!ctx) return;
          await fireGhlTrigger(ctx.locationId, ctx.contactId, TRIGGERS.PACKAGE_PURCHASED, {
            packageName: pkg.name,
            sessionsTotal: pkg.sessionCount,
            expiresAt: expiresAt?.toISOString() ?? null,
          });
        } catch (err) {
          console.error("[GHL Trigger] package_purchased (free) failed:", err);
        }
      })();

      return NextResponse.json({ url: successUrl });
    }

    if (!pkg.stripePriceId) {
      return NextResponse.json(
        { error: "Package has no Stripe price. Contact your provider." },
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

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
      customer: client.stripeCustomerId ?? undefined,
      customer_email: client.stripeCustomerId ? undefined : (client.email ?? undefined),
      success_url: successUrl,
      cancel_url: `${base}/portal/packages`,
      metadata,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Could not start checkout. Try again or contact your provider." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
