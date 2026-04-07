import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  clients,
  clientPackages,
  clientSubscriptions,
  packages,
  subscriptionPlans,
  providers,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendInvoiceEmail } from "@/lib/email/invoice";
import { requireAdminProvider } from "@/lib/auth-provider";

function formatCurrencyAmount(amount: string, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(parseFloat(amount));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// POST /api/invoices — send an invoice for a package or subscription assignment
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, id: assignmentId, providerId } = body;

  if (!type || !assignmentId || !providerId) {
    return NextResponse.json({ error: "type, id, and providerId required" }, { status: 400 });
  }

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  const [provider] = await db.select().from(providers).where(eq(providers.id, providerId));
  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  let clientRecord: typeof clients.$inferSelect | undefined;
  let itemName: string;
  let amount: string;
  let currency: string;

  if (type === "package") {
    const [row] = await db
      .select({ cp: clientPackages, pkg: packages, client: clients })
      .from(clientPackages)
      .innerJoin(packages, eq(clientPackages.packageId, packages.id))
      .innerJoin(clients, eq(clientPackages.clientId, clients.id))
      .where(eq(clientPackages.id, assignmentId));

    if (!row) return NextResponse.json({ error: "Package assignment not found" }, { status: 404 });
    clientRecord = row.client;
    itemName = `${row.pkg.name} (${row.pkg.sessionCount} sessions)`;
    amount = row.pkg.price;
    currency = row.pkg.currency;
  } else if (type === "subscription") {
    const [row] = await db
      .select({ cs: clientSubscriptions, plan: subscriptionPlans, client: clients })
      .from(clientSubscriptions)
      .innerJoin(subscriptionPlans, eq(clientSubscriptions.planId, subscriptionPlans.id))
      .innerJoin(clients, eq(clientSubscriptions.clientId, clients.id))
      .where(eq(clientSubscriptions.id, assignmentId));

    if (!row) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    clientRecord = row.client;
    itemName = `${row.plan.name} (${row.plan.sessionsPerPeriod} sessions/${row.plan.billingPeriod.replace("ly", "")})`;
    amount = row.plan.price;
    currency = row.plan.currency;
  } else {
    return NextResponse.json({ error: "type must be 'package' or 'subscription'" }, { status: 400 });
  }

  if (!clientRecord?.email) {
    return NextResponse.json({ error: "Client has no email address" }, { status: 422 });
  }

  await sendInvoiceEmail({
    clientEmail: clientRecord.email,
    clientName: clientRecord.name,
    providerName: provider.name,
    providerEmail: provider.email,
    invoiceBusinessName: provider.invoiceBusinessName,
    invoiceAddress: provider.invoiceAddress,
    invoiceTaxId: provider.invoiceTaxId,
    invoiceLogoUrl: provider.invoiceLogoUrl,
    invoiceFooterNote: provider.invoiceFooterNote,
    itemName,
    amount: formatCurrencyAmount(amount, currency),
    currency,
    issuedAt: formatDate(new Date()),
    invoiceNumber: `INV-${Date.now()}`,
  });

  return NextResponse.json({ ok: true });
}
