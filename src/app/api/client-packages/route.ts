import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientPackages, packages, clients, providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendInvoiceEmail } from "@/lib/email/invoice";

function formatCurrencyAmount(amount: string, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(parseFloat(amount));
}

// Manually assign a package to a client (no payment required)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, packageId, notes, paymentMethod } = body;

  if (!clientId || !packageId) {
    return NextResponse.json({ error: "clientId and packageId required" }, { status: 400 });
  }

  const [pkg] = await db.select().from(packages).where(eq(packages.id, packageId));
  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  const expiresAt = pkg.validityDays
    ? new Date(Date.now() + pkg.validityDays * 86400 * 1000)
    : null;

  const [clientPkg] = await db
    .insert(clientPackages)
    .values({
      clientId,
      packageId,
      sessionsTotal: pkg.sessionCount,
      sessionsUsed: 0,
      sessionsRemaining: pkg.sessionCount,
      paymentMethod: paymentMethod ?? null,
      expiresAt,
    })
    .returning();

  // Auto-send invoice if provider setting is enabled (non-blocking)
  (async () => {
    try {
      const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
      if (!client?.email) return;

      const [provider] = await db.select().from(providers).where(eq(providers.id, pkg.providerId));
      if (!provider?.autoSendInvoiceOnPackage) return;

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
        itemName: `${pkg.name} (${pkg.sessionCount} sessions)`,
        amount: formatCurrencyAmount(pkg.price, pkg.currency),
        currency: pkg.currency,
        issuedAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        invoiceNumber: `INV-${Date.now()}`,
      });
    } catch (err) {
      console.error("[Invoice] Auto-send on package failed:", err);
    }
  })();

  return NextResponse.json({ clientPackage: clientPkg }, { status: 201 });
}
