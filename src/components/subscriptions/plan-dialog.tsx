"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Plan {
  id: string;
  name: string;
  description?: string | null;
  sessionsPerPeriod: number;
  sessionDurationMins?: number | null;
  billingPeriod: string;
  price: string;
  currency: string;
  isActive: boolean;
  isPublic: boolean;
  sessionType?: "individual" | "group";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  defaultCurrency?: string;
  plan?: Plan | null;
  onSuccess: () => void;
}

const BILLING_PERIODS = ["weekly", "monthly", "yearly"] as const;
const CURRENCIES = ["usd", "gbp", "eur", "cad", "aud", "nzd", "chf", "sek", "nok", "dkk", "jpy", "sgd", "hkd", "mxn", "brl", "zar", "aed"];
const DURATIONS = [30, 45, 60, 75, 90, 120];

export function PlanDialog({ open, onOpenChange, providerId, defaultCurrency = "usd", plan, onSuccess }: Props) {
  const isEdit = !!plan;
  const [sessionType, setSessionType] = useState<"individual" | "group">("individual");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sessionsPerPeriod, setSessionsPerPeriod] = useState("4");
  const [sessionDurationMins, setSessionDurationMins] = useState("");
  const [billingPeriod, setBillingPeriod] = useState<string>("monthly");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (plan) {
      setSessionType(plan.sessionType ?? "individual");
      setName(plan.name);
      setDescription(plan.description ?? "");
      setSessionsPerPeriod(String(plan.sessionsPerPeriod));
      setSessionDurationMins(plan.sessionDurationMins ? String(plan.sessionDurationMins) : "");
      setBillingPeriod(plan.billingPeriod);
      setPrice(plan.price);
      setCurrency(plan.currency);
      setIsPublic(plan.isPublic);
    } else {
      setSessionType("individual");
      setName("");
      setDescription("");
      setSessionsPerPeriod("4");
      setSessionDurationMins("");
      setBillingPeriod("monthly");
      setPrice("");
      setCurrency(defaultCurrency);
      setIsPublic(true);
    }
    setError("");
  }, [plan, open, defaultCurrency]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = isEdit ? `/api/subscriptions/${plan!.id}` : "/api/subscriptions";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          name,
          description,
          sessionsPerPeriod,
          sessionDurationMins: sessionDurationMins || null,
          billingPeriod,
          price,
          currency,
          sessionType,
          isPublic,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive() {
    if (!plan) return;
    setLoading(true);
    try {
      await fetch(`/api/subscriptions/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Plan" : "Create Subscription Plan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Session type toggle */}
          <div className="flex rounded-lg border border-gray-200 p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setSessionType("individual")}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${sessionType === "individual" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}
            >
              1-to-1
            </button>
            <button
              type="button"
              onClick={() => setSessionType("group")}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${sessionType === "group" ? "bg-teal-600 text-white" : "text-gray-600 hover:text-gray-900"}`}
            >
              Group
            </button>
          </div>

          <div className="space-y-1">
            <Label htmlFor="planName">Name *</Label>
            <Input
              id="planName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly Training Plan"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="planDesc">Description</Label>
            <Input
              id="planDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sessionsPerPeriod">Sessions / Period *</Label>
              <Input
                id="sessionsPerPeriod"
                type="number"
                min="1"
                value={sessionsPerPeriod}
                onChange={(e) => setSessionsPerPeriod(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Session Duration</Label>
              <Select
                value={sessionDurationMins || "default"}
                onValueChange={(v) => setSessionDurationMins(v === "default" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Use default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Use provider default</SelectItem>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Billing Period *</Label>
              <Select value={billingPeriod} onValueChange={setBillingPeriod} disabled={isEdit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_PERIODS.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="planPrice">Price *</Label>
            <div className="flex gap-2">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="planPrice"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="200.00"
                required={!isEdit}
                className="flex-1"
              />
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="flex rounded-lg border border-gray-200 p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${isPublic ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}
            >
              Public
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${!isPublic ? "bg-gray-700 text-white" : "text-gray-600 hover:text-gray-900"}`}
            >
              Private
            </button>
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            {isPublic ? "Clients can see and purchase this plan in the portal." : "Only you can assign this plan — clients won't see it."}
          </p>

          {!isEdit && (
            <p className="text-xs text-gray-500">
              A Stripe product and recurring price will be created automatically.
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Plan"}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleActive}
                disabled={loading}
              >
                {plan?.isActive ? "Deactivate" : "Activate"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
