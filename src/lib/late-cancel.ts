import { differenceInHours } from "date-fns";
import { db } from "@/lib/db";
import {
  providers,
  clientPackages,
  clientSubscriptions,
  lateCancellationLogs,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type LateCancelOutcome = "deducted" | "waived";

export interface LateCancelResult {
  isLate: boolean;
  action: "deduct_session" | null;
  outcome: LateCancelOutcome | null;
  shouldRestoreSession: boolean;
}

interface Params {
  bookingId: string;
  clientId: string;
  providerId: string;
  sessionStartTime: Date;
  clientPackageId: string | null | undefined;
  clientSubscriptionId: string | null | undefined;
  isPortalCancel: boolean;
}

export async function checkAndApplyLateCancelPolicy(
  params: Params
): Promise<LateCancelResult> {
  const { bookingId, clientId, providerId, sessionStartTime, isPortalCancel } = params;

  if (!isPortalCancel) {
    return { isLate: false, action: null, outcome: null, shouldRestoreSession: true };
  }

  const [provider] = await db
    .select({
      lateCancelWindowHours: providers.lateCancelWindowHours,
      lateCancelAction: providers.lateCancelAction,
    })
    .from(providers)
    .where(eq(providers.id, providerId));

  if (!provider?.lateCancelWindowHours || provider.lateCancelAction !== "deduct_session") {
    return { isLate: false, action: null, outcome: null, shouldRestoreSession: true };
  }

  const hoursUntil = differenceInHours(sessionStartTime, new Date());
  if (hoursUntil >= provider.lateCancelWindowHours) {
    return { isLate: false, action: null, outcome: null, shouldRestoreSession: true };
  }

  if (params.clientPackageId) {
    const [pkg] = await db
      .select()
      .from(clientPackages)
      .where(eq(clientPackages.id, params.clientPackageId));
    if (pkg) {
      const newRemaining = Math.max(0, pkg.sessionsRemaining - 1);
      await db
        .update(clientPackages)
        .set({
          sessionsUsed: pkg.sessionsUsed + 1,
          sessionsRemaining: newRemaining,
          status: newRemaining <= 0 ? "exhausted" : "active",
        })
        .where(eq(clientPackages.id, pkg.id));
    }
  }
  if (params.clientSubscriptionId) {
    const [sub] = await db
      .select()
      .from(clientSubscriptions)
      .where(eq(clientSubscriptions.id, params.clientSubscriptionId));
    if (sub) {
      await db
        .update(clientSubscriptions)
        .set({ sessionsUsedThisPeriod: sub.sessionsUsedThisPeriod + 1 })
        .where(eq(clientSubscriptions.id, sub.id));
    }
  }

  await db.insert(lateCancellationLogs).values({
    bookingId,
    clientId,
    providerId,
    sessionStartTime,
    windowHours: provider.lateCancelWindowHours,
    action: "deduct_session",
    outcome: "deducted",
  });

  return {
    isLate: true,
    action: "deduct_session",
    outcome: "deducted",
    shouldRestoreSession: false,
  };
}
