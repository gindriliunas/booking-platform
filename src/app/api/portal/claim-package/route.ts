import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { packages, clientPackages } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await getPortalClient(session.email);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { packageId } = await req.json();
  if (!packageId) {
    return NextResponse.json({ error: "packageId required" }, { status: 400 });
  }

  const [pkg] = await db.select().from(packages).where(eq(packages.id, packageId));
  if (!pkg || pkg.providerId !== client.providerId) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }
  if (!pkg.isActive || !pkg.isPublic) {
    return NextResponse.json({ error: "Package not available" }, { status: 400 });
  }

  const price = parseFloat(pkg.price);
  if (!pkg.isFreeTrialSession && price > 0) {
    return NextResponse.json(
      { error: "Paid packages must be assigned by your provider." },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select({ id: clientPackages.id })
    .from(clientPackages)
    .where(and(eq(clientPackages.clientId, client.id), eq(clientPackages.packageId, pkg.id)))
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: "You already have this package." }, { status: 409 });
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
    paymentMethod: "manual",
    expiresAt,
  });

  return NextResponse.json({ ok: true });
}
