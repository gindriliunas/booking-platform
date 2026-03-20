"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PlanDialog } from "@/components/subscriptions/plan-dialog";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { formatCurrency } from "@/lib/utils";
import { useProvider } from "@/components/provider-context";

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
  sessionType?: "individual" | "group";
  createdAt: string;
}

export default function SubscriptionsPage() {
  const { providerId: PROVIDER_ID, provider } = useProvider();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const providerCurrency = provider?.currency ?? "usd";

  const fetchPlans = useCallback(async () => {
    if (!PROVIDER_ID) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions?providerId=${PROVIDER_ID}`);
      const data = await res.json();
      setPlans(data.plans ?? []);
    } finally {
      setLoading(false);
    }
  }, [PROVIDER_ID]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  function handleSuccess() {
    setDialogOpen(false);
    setEditPlan(null);
    fetchPlans();
  }

  const active = plans.filter((p) => p.isActive);
  const inactive = plans.filter((p) => !p.isActive);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="mt-1 text-sm text-gray-500">
            {active.length} active · {inactive.length} inactive
          </p>
        </div>
        <Button onClick={() => { setEditPlan(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading plans…</div>
      ) : plans.length === 0 ? (
        <div className="text-sm text-gray-500 py-8 text-center">
          No subscription plans yet. Create one to offer recurring sessions.
        </div>
      ) : (
        <div className="space-y-3">
          {[...active, ...inactive].map((plan) => (
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
                    onClick={() => { setEditPlan(plan); setDialogOpen(true); }}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PlanDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditPlan(null); }}
        providerId={PROVIDER_ID}
        defaultCurrency={providerCurrency}
        plan={editPlan}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
