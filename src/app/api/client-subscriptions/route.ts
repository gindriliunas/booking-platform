import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientSubscriptions, subscriptionPlans, clients, providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendInvoiceEmail } from "@/lib/email/invoice";

function formatCurrencyAmount(amount: string, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(parseFloat(amount));
}

// Manually assign a subscription plan to a client (no payment required)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, planId } = body;

  if (!clientId || !planId) {
    return NextResponse.json({ error: "clientId and planId required" }, { status: 400 });
  }

  const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId));
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const now = new Date();
  const periodEnd = new Date(now);
  if (plan.billingPeriod === "weekly") periodEnd.setDate(periodEnd.getDate() + 7);
  else if (plan.billingPeriod === "monthly") periodEnd.setMonth(periodEnd.getMonth() + 1);
  else if (plan.billingPeriod === "yearly") periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const { paymentMethod } = body;

  const [clientSub] = await db
    .insert(clientSubscriptions)
    .values({
      clientId,
      planId,
      sessionsPerPeriod: plan.sessionsPerPeriod,
      sessionsUsedThisPeriod: 0,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      paymentMethod: paymentMethod ?? null,
    })
    .returning();

  // Auto-send invoice if provider setting is enabled (non-blocking)
  (async () => {
    try {
      const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
      if (!client?.email) return;

      const [provider] = await db.select().from(providers).where(eq(providers.id, plan.providerId));
      if (!provider?.autoSendInvoiceOnSubscription) return;

      await sendInvoiceEmail({
        clientEmail: client.email,
        clientName: client.name,
        providerName: provider.name,
        providerEmail: provider.email,
        invoiceBusinessName: provider.invoiceBusinessName,
        invoiceAddress: provider.invoiceAddress,
        invoiceTaxId: provider.invoiceTaxId,
        invoiceLogoUrl: provider.invoiceLogoUrl,
        invoiceFooterNote: provider.invoiceFooterNote,
        itemName: `${plan.name} (${plan.sessionsPerPeriod} sessions/${plan.billingPeriod.replace("ly", "")})`,
        amount: formatCurrencyAmount(plan.price, plan.currency),
        currency: plan.currency,
        issuedAt: now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        invoiceNumber: `INV-${Date.now()}`,
      });
    } catch (err) {
      console.error("[Invoice] Auto-send on subscription failed:", err);
    }
  })();

  return NextResponse.json({ clientSubscription: clientSub }, { status: 201 });
}
