import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { providers, packages, subscriptionPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminProvider } from "@/lib/auth-provider";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authError = await requireAdminProvider(id);
  if (authError) return authError;

  const body = await req.json();
  const {
    name, email, phone, serviceType, timezone, sessionDurationMins,
    currency, stripeSecretKey, stripeWebhookSecret,
    allowIndividualSelfBook, allowGroupSelfBook,
    enableWaitlist,
    lateCancelWindowHours, lateCancelAction, lateCancelChargeAmount,
    invoiceBusinessName, invoiceAddress, invoiceTaxId, invoiceLogoUrl,
    invoiceFooterNote, autoSendInvoiceOnPackage, autoSendInvoiceOnSubscription,
  } = body;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email ?? null;
  if (phone !== undefined) updateData.phone = phone ?? null;
  if (serviceType !== undefined) updateData.serviceType = serviceType ?? null;
  if (timezone !== undefined) updateData.timezone = timezone ?? "UTC";
  if (sessionDurationMins !== undefined) updateData.sessionDurationMins = sessionDurationMins ? parseInt(sessionDurationMins) : undefined;
  if (currency !== undefined) updateData.currency = currency ?? "usd";

  if (allowIndividualSelfBook !== undefined) updateData.allowIndividualSelfBook = allowIndividualSelfBook;
  if (allowGroupSelfBook !== undefined) updateData.allowGroupSelfBook = allowGroupSelfBook;
  if (enableWaitlist !== undefined) updateData.enableWaitlist = enableWaitlist;
  if (lateCancelWindowHours !== undefined) updateData.lateCancelWindowHours = lateCancelWindowHours ? parseInt(lateCancelWindowHours) : null;
  if (lateCancelAction !== undefined) updateData.lateCancelAction = lateCancelAction || null;
  if (lateCancelChargeAmount !== undefined) updateData.lateCancelChargeAmount = lateCancelChargeAmount || null;

  if (invoiceBusinessName !== undefined) updateData.invoiceBusinessName = invoiceBusinessName || null;
  if (invoiceAddress !== undefined) updateData.invoiceAddress = invoiceAddress || null;
  if (invoiceTaxId !== undefined) updateData.invoiceTaxId = invoiceTaxId || null;
  if (invoiceLogoUrl !== undefined) updateData.invoiceLogoUrl = invoiceLogoUrl || null;
  if (invoiceFooterNote !== undefined) updateData.invoiceFooterNote = invoiceFooterNote || null;
  if (autoSendInvoiceOnPackage !== undefined) updateData.autoSendInvoiceOnPackage = autoSendInvoiceOnPackage;
  if (autoSendInvoiceOnSubscription !== undefined) updateData.autoSendInvoiceOnSubscription = autoSendInvoiceOnSubscription;

  // Allow clearing keys by passing empty string
  if (stripeSecretKey !== undefined) {
    updateData.stripeSecretKey = stripeSecretKey || null;
  }
  if (stripeWebhookSecret !== undefined) {
    updateData.stripeWebhookSecret = stripeWebhookSecret || null;
  }

  const [updated] = await db
    .update(providers)
    .set(updateData)
    .where(eq(providers.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // When currency changes, cascade to all packages and subscription plans
  if (currency !== undefined) {
    await Promise.all([
      db.update(packages).set({ currency }).where(eq(packages.providerId, id)),
      db.update(subscriptionPlans).set({ currency }).where(eq(subscriptionPlans.providerId, id)),
    ]);
  }

  return NextResponse.json({ ok: true });
}
