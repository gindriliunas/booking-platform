"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Package as PackageIcon, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackageDialog } from "@/components/packages/package-dialog";
import { PlanDialog } from "@/components/subscriptions/plan-dialog";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { formatCurrency } from "@/lib/utils";
import { useProvider } from "@/components/provider-context";

interface Package {
  id: string;
  name: string;
  description?: string | null;
  sessionCount: number;
  sessionDurationMins?: number | null;
  price: string;
  currency: string;
  validityDays?: number | null;
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  isActive: boolean;
  isPublic: boolean;
  sessionType?: "individual" | "group";
  createdAt: string;
}

interface Plan {
  id: string;
  name: string;
  description?: string | null;
  sessionsPerPeriod: number;
  sessionDurationMins?: number | null;
  billingPeriod: string;
  price: string;
  currency: string;
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  isActive: boolean;
  isPublic: boolean;
  sessionType?: "individual" | "group";
  createdAt: string;
}

export default function PackagesPage() {
  const { providerId: PROVIDER_ID, provider } = useProvider();
  const providerCurrency = provider?.currency ?? "usd";

  // Packages state
  const [packages, setPackages] = useState<Package[]>([]);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [pkgDialogOpen, setPkgDialogOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<Package | null>(null);

  // Subscriptions state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const fetchPackages = useCallback(async () => {
    if (!PROVIDER_ID) return;
    setPkgLoading(true);
    try {
      const res = await fetch(`/api/packages?providerId=${PROVIDER_ID}`);
      const data = await res.json();
      setPackages(data.packages ?? []);
    } finally {
      setPkgLoading(false);
    }
  }, [PROVIDER_ID]);

  const fetchPlans = useCallback(async () => {
    if (!PROVIDER_ID) return;
    setPlanLoading(true);
    try {
      const res = await fetch(`/api/subscriptions?providerId=${PROVIDER_ID}`);
      const data = await res.json();
      setPlans(data.plans ?? []);
    } finally {
      setPlanLoading(false);
    }
  }, [PROVIDER_ID]);

  useEffect(() => { fetchPackages(); fetchPlans(); }, [fetchPackages, fetchPlans]);

  const activePkgs = packages.filter((p) => p.isActive);
  const inactivePkgs = packages.filter((p) => !p.isActive);
  const activePlans = plans.filter((p) => p.isActive);
  const inactivePlans = plans.filter((p) => !p.isActive);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Packages</h1>

      <Tabs defaultValue="packages">
        <TabsList>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscription Plans</TabsTrigger>
        </TabsList>

        {/* ── Packages tab ── */}
        <TabsContent value="packages" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {activePkgs.length} active · {inactivePkgs.length} inactive
            </p>
            <Button onClick={() => { setEditPkg(null); setPkgDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Package
            </Button>
          </div>

          {pkgLoading ? (
            <div className="text-sm text-gray-500 py-8 text-center">Loading packages…</div>
          ) : packages.length === 0 ? (
            <div className="text-sm text-gray-500 py-8 text-center">
              No packages yet. Create one to start selling sessions.
            </div>
          ) : (
            <div className="space-y-3">
              {[...activePkgs, ...inactivePkgs].map((pkg) => (
                <Card key={pkg.id} className={pkg.isActive ? "" : "opacity-60"}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="rounded-lg bg-orange-50 p-2.5 shrink-0">
                      <PackageIcon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{pkg.name}</p>
                        <Badge variant={pkg.isActive ? "default" : "secondary"}>
                          {pkg.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {pkg.sessionType === "group" && (
                          <Badge className="bg-teal-100 text-teal-700 border-teal-200">Group</Badge>
                        )}
                        {!pkg.isPublic && (
                          <Badge variant="secondary" className="text-gray-600 bg-gray-100">Private</Badge>
                        )}
                        {!pkg.stripePriceId && (
                          <Badge variant="secondary" className="text-orange-600 bg-orange-50">
                            No Stripe price
                          </Badge>
                        )}
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{pkg.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{formatCurrency(pkg.price, pkg.currency)}</span>
                        <span>{pkg.sessionCount} sessions</span>
                        {pkg.sessionDurationMins && <span>{pkg.sessionDurationMins} min/session</span>}
                        {pkg.validityDays && <span>Valid {pkg.validityDays} days</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <CopyLinkButton
                        providerId={PROVIDER_ID}
                        type="package"
                        itemId={pkg.id}
                        hasStripePrice={!!pkg.stripePriceId}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditPkg(pkg); setPkgDialogOpen(true); }}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Subscription Plans tab ── */}
        <TabsContent value="subscriptions" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {activePlans.length} active · {inactivePlans.length} inactive
            </p>
            <Button onClick={() => { setEditPlan(null); setPlanDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>

          {planLoading ? (
            <div className="text-sm text-gray-500 py-8 text-center">Loading plans…</div>
          ) : plans.length === 0 ? (
            <div className="text-sm text-gray-500 py-8 text-center">
              No subscription plans yet. Create one to offer recurring sessions.
            </div>
          ) : (
            <div className="space-y-3">
              {[...activePlans, ...inactivePlans].map((plan) => (
                <Card key={plan.id} className={plan.isActive ? "" : "opacity-60"}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="rounded-lg bg-purple-50 p-2.5 shrink-0">
                      <Repeat className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{plan.name}</p>
                        <Badge variant={plan.isActive ? "default" : "secondary"}>
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {plan.sessionType === "group" && (
                          <Badge className="bg-teal-100 text-teal-700 border-teal-200">Group</Badge>
                        )}
                        {!plan.isPublic && (
                          <Badge variant="secondary" className="text-gray-600 bg-gray-100">Private</Badge>
                        )}
                        {!plan.stripePriceId && (
                          <Badge variant="secondary" className="text-orange-600 bg-orange-50">
                            No Stripe price
                          </Badge>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{plan.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(plan.price, plan.currency)}/{plan.billingPeriod.replace("ly", "")}
                        </span>
                        <span>{plan.sessionsPerPeriod} sessions/{plan.billingPeriod.replace("ly", "")}</span>
                        {plan.sessionDurationMins && <span>{plan.sessionDurationMins} min/session</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <CopyLinkButton
                        providerId={PROVIDER_ID}
                        type="subscription"
                        itemId={plan.id}
                        hasStripePrice={!!plan.stripePriceId}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditPlan(plan); setPlanDialogOpen(true); }}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PackageDialog
        open={pkgDialogOpen}
        onOpenChange={(o) => { setPkgDialogOpen(o); if (!o) setEditPkg(null); }}
        providerId={PROVIDER_ID}
        defaultCurrency={providerCurrency}
        pkg={editPkg}
        onSuccess={() => { setPkgDialogOpen(false); setEditPkg(null); fetchPackages(); }}
      />

      <PlanDialog
        open={planDialogOpen}
        onOpenChange={(o) => { setPlanDialogOpen(o); if (!o) setEditPlan(null); }}
        providerId={PROVIDER_ID}
        defaultCurrency={providerCurrency}
        plan={editPlan}
        onSuccess={() => { setPlanDialogOpen(false); setEditPlan(null); fetchPlans(); }}
      />
    </div>
  );
}
