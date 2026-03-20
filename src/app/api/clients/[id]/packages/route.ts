import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientPackages, packages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clientId } = await params;
  const sessionType = req.nextUrl.searchParams.get("sessionType");

  const conditions = [
    eq(clientPackages.clientId, clientId),
    eq(clientPackages.status, "active"),
  ];
  if (sessionType === "individual" || sessionType === "group") {
    conditions.push(eq(packages.sessionType, sessionType));
  }

  const rows = await db
    .select({
      id: clientPackages.id,
      packageName: packages.name,
      sessionType: packages.sessionType,
      sessionsTotal: clientPackages.sessionsTotal,
      sessionsUsed: clientPackages.sessionsUsed,
      sessionsRemaining: clientPackages.sessionsRemaining,
      status: clientPackages.status,
      expiresAt: clientPackages.expiresAt,
      purchasedAt: clientPackages.purchasedAt,
    })
    .from(clientPackages)
    .innerJoin(packages, eq(clientPackages.packageId, packages.id))
    .where(and(...conditions));

  return NextResponse.json({ packages: rows });
}
