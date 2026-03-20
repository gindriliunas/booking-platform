import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientPackages, clientSubscriptions, packages, subscriptionPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  TRIGGERS,
  fireGhlTrigger,
  getClientTriggerContext,
} from "@/lib/ghl/triggers";

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

  // Fire package_purchased trigger (non-blocking)
  (async () => {
    try {
      const ctx = await getClientTriggerContext(clientId);
      if (!ctx) return;
      await fireGhlTrigger(ctx.locationId, ctx.contactId, TRIGGERS.PACKAGE_PURCHASED, {
        packageName: pkg.name,
        sessionsTotal: pkg.sessionCount,
        expiresAt: expiresAt?.toISOString() ?? null,
      });
    } catch (err) {
      console.error("[GHL Trigger] package_purchased (manual) failed:", err);
    }
  })();

  return NextResponse.json({ clientPackage: clientPkg }, { status: 201 });
}
