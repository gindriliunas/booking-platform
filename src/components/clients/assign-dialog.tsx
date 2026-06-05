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
}

interface PlanOption {
  id: string;
  name: string;
  price: string;
  currency: string;
  sessionsPerPeriod: number;
  billingPeriod: string;
  sessionType?: "individual" | "group";
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

  function handleItemChange(type: "package" | "plan", id: string) {
    if (type === "package") setSelectedPackageId(id);
    else setSelectedPlanId(id);
  }

  async function handleAssign() {
    setLoading(true);
    setError("");
    try {
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
      <DialogContent className="max-w-sm w-full overflow-hidden">
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
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              Sessions will be added to the client&apos;s account immediately.
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
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">Subscription starts today.</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={handleAssign} disabled={loading} className="w-full">
          {loading ? "Assigning…" : "Assign"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
