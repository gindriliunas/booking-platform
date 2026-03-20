import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { availability, clientPackages, clientSubscriptions, packages, subscriptionPlans, providers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getPortalClient(userId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const [weeklyAvailability, activePkgRows, activeSubRows, providerRows] = await Promise.all([
    db
      .select({
        dayOfWeek: availability.dayOfWeek,
        startTime: availability.startTime,
        endTime: availability.endTime,
      })
      .from(availability)
      .where(eq(availability.providerId, client.providerId))
      .orderBy(availability.dayOfWeek),
    db
      .select({ sessionDurationMins: packages.sessionDurationMins })
      .from(clientPackages)
      .innerJoin(packages, eq(clientPackages.packageId, packages.id))
      .where(
        and(
          eq(clientPackages.clientId, client.id),
          eq(clientPackages.status, "active"),
          eq(packages.sessionType, "individual")
        )
      )
      .limit(1),
    db
      .select({ sessionDurationMins: subscriptionPlans.sessionDurationMins })
      .from(clientSubscriptions)
      .innerJoin(subscriptionPlans, eq(clientSubscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(clientSubscriptions.clientId, client.id),
          eq(clientSubscriptions.status, "active"),
          eq(subscriptionPlans.sessionType, "individual")
        )
      )
      .limit(1),
    db
      .select({ sessionDurationMins: providers.sessionDurationMins })
      .from(providers)
      .where(eq(providers.id, client.providerId))
      .limit(1),
  ]);

  const pkgDuration = activePkgRows[0]?.sessionDurationMins ?? null;
  const subDuration = activeSubRows[0]?.sessionDurationMins ?? null;
  const providerDuration = providerRows[0]?.sessionDurationMins ?? 60;
  // Package duration takes precedence, then subscription, then provider default
  const sessionDurationMins = pkgDuration ?? subDuration ?? providerDuration;

  return NextResponse.json({ weeklyAvailability, sessionDurationMins });
}
