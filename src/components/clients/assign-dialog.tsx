"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface PackageOption {
  id: string;
  name: string;
  price: string;
  currency: string;
  sessionCount: number;
  sessionType?: "individual" | "group";
  stripePriceId?: string | null;
}

interface PlanOption {
  id: string;
  name: string;
  price: string;
  currency: string;
  sessionsPerPeriod: number;
  billingPeriod: string;
  sessionType?: "individual" | "group";
  stripePriceId?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  packages: PackageOption[];
  plans: PlanOption[];
  onSuccess: () => void;
}

export function AssignDialog({ open, onOpenChange, clientId, packages, plans, onSuccess }: Props) {
  const [tab, setTab] = useState<"package" | "subscription">("package");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setSelectedPackageId("");
    setSelectedPlanId("");
    setPaymentMethod("cash");
    setError("");
  }

  const selectedPkg = packages.find((p) => p.id === selectedPackageId);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const currentHasStripe =
    tab === "package" ? !!selectedPkg?.stripePriceId : !!selectedPlan?.stripePriceId;

  function handleItemChange(type: "package" | "plan", id: string) {
    if (type === "package") {
      setSelectedPackageId(id);
      const pkg = packages.find((p) => p.id === id);
      if (!pkg?.stripePriceId && paymentMethod === "stripe") setPaymentMethod("cash");
    } else {
      setSelectedPlanId(id);
      const plan = plans.find((p) => p.id === id);
      if (!plan?.stripePriceId && paymentMethod === "stripe") setPaymentMethod("cash");
    }
  }

  async function handleAssign() {
    setLoading(true);
    setError("");
    try {
      if (paymentMethod === "stripe") {
        // Redirect to Stripe checkout
        const itemId = tab === "package" ? selectedPackageId : selectedPlanId;
        if (!itemId) { setError("Select a package or plan"); setLoading(false); return; }
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: tab === "package" ? "package" : "subscription", itemId, clientId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create checkout");
        window.location.href = data.url;
        return;
      }

      if (tab === "package") {
        if (!selectedPackageId) { setError("Select a package"); setLoading(false); return; }
        const res = await fetch("/api/client-packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, packageId: selectedPackageId, paymentMethod }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      } else {
        if (!selectedPlanId) { setError("Select a plan"); setLoading(false); return; }
        const res = await fetch("/api/client-subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, planId: selectedPlanId, paymentMethod }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      }
      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Package / Subscription</DialogTitle>
        </DialogHeader>

        {/* Tab toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1 gap-1">
          <button
            type="button"
            onClick={() => setTab("package")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              tab === "package" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Package
          </button>
          <button
            type="button"
            onClick={() => setTab("subscription")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              tab === "subscription" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Subscription
          </button>
        </div>

        {tab === "package" ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Package</Label>
              {packages.length === 0 ? (
                <p className="text-sm text-gray-500">No active packages. Create one first.</p>
              ) : (
                <Select value={selectedPackageId} onValueChange={(v) => handleItemChange("package", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a package…" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.sessionCount} sessions ({formatCurrency(p.price, p.currency)}) · {p.sessionType === "group" ? "Group" : "1-to-1"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  {currentHasStripe && <SelectItem value="stripe">Pay via Stripe</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              {paymentMethod === "stripe"
                ? "Client will be redirected to a Stripe checkout page to complete payment."
                : "Sessions will be added to the client's account immediately."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Subscription Plan</Label>
              {plans.length === 0 ? (
                <p className="text-sm text-gray-500">No active plans. Create one first.</p>
              ) : (
                <Select value={selectedPlanId} onValueChange={(v) => handleItemChange("plan", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan…" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.sessionsPerPeriod}/{p.billingPeriod.replace("ly", "")} ({formatCurrency(p.price, p.currency)}) · {p.sessionType === "group" ? "Group" : "1-to-1"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  {currentHasStripe && <SelectItem value="stripe">Pay via Stripe</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              {paymentMethod === "stripe"
                ? "Client will be redirected to a Stripe checkout page to complete payment."
                : "Subscription starts today."}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={handleAssign} disabled={loading} className="w-full">
          {loading ? (paymentMethod === "stripe" ? "Redirecting…" : "Assigning…") : paymentMethod === "stripe" ? "Send Stripe Link" : "Assign"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
