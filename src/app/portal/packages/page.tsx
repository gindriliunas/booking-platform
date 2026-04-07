import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clientPackages, packages, clientSubscriptions, subscriptionPlans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package as PackageIcon, Repeat } from "lucide-react";
import { formatDateOnly, formatCurrency } from "@/lib/utils";
import { CheckoutButton } from "./checkout-button";
import Link from "next/link";

const PAGE_SIZE = 10;

export default async function PortalPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ pkgPage?: string; subPage?: string; payment?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/portal/sign-in");

  const sp = await searchParams;
  const pkgPage = Math.max(1, parseInt(sp.pkgPage ?? "1"));
  const subPage = Math.max(1, parseInt(sp.subPage ?? "1"));

  const client = await getPortalClient(userId);
  if (!client) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 max-w-md">
        <p className="text-sm text-amber-700">No client account linked. Please contact your provider.</p>
      </div>
    );
  }

  const [myPkgRows, mySubRows, availablePkgs] = await Promise.all([
    db
      .select({ cp: clientPackages, pkg: packages })
      .from(clientPackages)
      .innerJoin(packages, eq(clientPackages.packageId, packages.id))
      .where(eq(clientPackages.clientId, client.id))
      .orderBy(clientPackages.purchasedAt),
    db
      .select({ cs: clientSubscriptions, plan: subscriptionPlans })
      .from(clientSubscriptions)
      .innerJoin(subscriptionPlans, eq(clientSubscriptions.planId, subscriptionPlans.id))
      .where(eq(clientSubscriptions.clientId, client.id))
      .orderBy(clientSubscriptions.createdAt),
    db
      .select()
      .from(packages)
      .where(and(eq(packages.providerId, client.providerId), eq(packages.isActive, true), eq(packages.isPublic, true))),
  ]);

  const activeMyPkgs = myPkgRows.filter(({ cp }) => cp.status === "active");
  const otherMyPkgs = myPkgRows.filter(({ cp }) => cp.status !== "active");
  const sortedMyPkgs = [...activeMyPkgs, ...otherMyPkgs];
  const pkgTotal = sortedMyPkgs.length;
  const pkgSlice = sortedMyPkgs.slice((pkgPage - 1) * PAGE_SIZE, pkgPage * PAGE_SIZE);
  const pkgTotalPages = Math.max(1, Math.ceil(pkgTotal / PAGE_SIZE));

  const activeMySubs = mySubRows.filter(({ cs }) => cs.status === "active");
  const otherMySubs = mySubRows.filter(({ cs }) => cs.status !== "active");
  const sortedMySubs = [...activeMySubs, ...otherMySubs];
  const subTotal = sortedMySubs.length;
  const subSlice = sortedMySubs.slice((subPage - 1) * PAGE_SIZE, subPage * PAGE_SIZE);
  const subTotalPages = Math.max(1, Math.ceil(subTotal / PAGE_SIZE));

  const payment = sp.payment;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Plan</h1>
        {payment === "success" && (
          <div className="mt-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
            Payment successful! Your package will be activated shortly.
          </div>
        )}
      </div>

      {/* Packages */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <PackageIcon className="h-5 w-5 text-orange-500" /> Packages
        </h2>
        {sortedMyPkgs.length === 0 ? (
          <p className="text-sm text-gray-500">No packages yet.</p>
        ) : (
          <>
            {pkgSlice.map(({ cp, pkg }) => (
              <Card key={cp.id} className={cp.status !== "active" ? "opacity-60" : ""}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="rounded-lg bg-orange-50 p-2.5 shrink-0">
                    <PackageIcon className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{pkg.name}</p>
                      <Badge
                        variant={cp.status === "active" ? "default" : "secondary"}
                        className={
                          cp.status === "exhausted"
                            ? "bg-gray-100 text-gray-600"
                            : cp.status === "expired"
                            ? "bg-red-50 text-red-600"
                            : ""
                        }
                      >
                        {cp.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 max-w-[160px]">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${Math.round((cp.sessionsRemaining / cp.sessionsTotal) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {cp.sessionsRemaining} / {cp.sessionsTotal} remaining
                      </span>
                    </div>
                    {cp.expiresAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Expires {formatDateOnly(cp.expiresAt.toISOString())}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {pkgTotalPages > 1 && (
              <div className="flex items-center gap-2 pt-1">
                {pkgPage > 1 && (
                  <Link
                    href={`?pkgPage=${pkgPage - 1}&subPage=${subPage}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    &larr; Prev
                  </Link>
                )}
                <span className="text-sm text-gray-500">
                  {pkgPage} / {pkgTotalPages}
                </span>
                {pkgPage < pkgTotalPages && (
                  <Link
                    href={`?pkgPage=${pkgPage + 1}&subPage=${subPage}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Next &rarr;
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {/* Available packages to buy */}
        {availablePkgs.filter((p) => p.stripePriceId).length > 0 && (
          <div className="pt-4 space-y-2">
            <p className="text-sm font-medium text-gray-600">Available to purchase</p>
            {availablePkgs
              .filter((p) => p.stripePriceId)
              .map((pkg) => (
                <Card key={pkg.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{pkg.name}</p>
                      <p className="text-sm text-gray-500">
                        {pkg.sessionCount} sessions &middot; {formatCurrency(pkg.price, pkg.currency)}
                      </p>
                      {pkg.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{pkg.description}</p>
                      )}
                    </div>
                    <CheckoutButton packageId={pkg.id} label="Buy" />
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Subscriptions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Repeat className="h-5 w-5 text-purple-500" /> Subscriptions
        </h2>
        {sortedMySubs.length === 0 ? (
          <p className="text-sm text-gray-500">No subscriptions yet.</p>
        ) : (
          <>
            {subSlice.map(({ cs, plan }) => (
              <Card key={cs.id} className={cs.status !== "active" ? "opacity-60" : ""}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="rounded-lg bg-purple-50 p-2.5 shrink-0">
                    <Repeat className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      <Badge variant={cs.status === "active" ? "default" : "secondary"}>
                        {cs.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {cs.sessionsUsedThisPeriod} / {cs.sessionsPerPeriod} sessions used this{" "}
                      {plan.billingPeriod.replace("ly", "")}
                    </p>
                    {cs.currentPeriodEnd && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {cs.status === "cancelled" ? "Ends" : "Renews"}{" "}
                        {formatDateOnly(cs.currentPeriodEnd.toISOString())}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {subTotalPages > 1 && (
              <div className="flex items-center gap-2 pt-1">
                {subPage > 1 && (
                  <Link
                    href={`?pkgPage=${pkgPage}&subPage=${subPage - 1}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    &larr; Prev
                  </Link>
                )}
                <span className="text-sm text-gray-500">
                  {subPage} / {subTotalPages}
                </span>
                {subPage < subTotalPages && (
                  <Link
                    href={`?pkgPage=${pkgPage}&subPage=${subPage + 1}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Next &rarr;
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
