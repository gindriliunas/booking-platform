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

const CURRENCIES = ["usd", "gbp", "eur", "cad", "aud", "nzd", "chf", "sek", "nok", "dkk", "jpy", "sgd", "hkd", "mxn", "brl", "zar", "aed"];
const DURATIONS = [30, 45, 60, 75, 90, 120];

interface Package {
  id: string;
  name: string;
  description?: string | null;
  sessionCount: number;
  sessionDurationMins?: number | null;
  price: string;
  currency: string;
  validityDays?: number | null;
  isActive: boolean;
  isPublic?: boolean;
  isFreeTrialSession?: boolean;
  allowSelfBook?: boolean;
  sessionType?: "individual" | "group";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  defaultCurrency?: string;
  pkg?: Package | null;
  onSuccess: () => void;
}

export function PackageDialog({ open, onOpenChange, providerId, defaultCurrency = "usd", pkg, onSuccess }: Props) {
  const isEdit = !!pkg;
  const [sessionType, setSessionType] = useState<"individual" | "group">("individual");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sessionCount, setSessionCount] = useState("10");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [sessionDurationMins, setSessionDurationMins] = useState("");
  const [validityDays, setValidityDays] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isFreeTrialSession, setIsFreeTrialSession] = useState(false);
  const [allowSelfBook, setAllowSelfBook] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (pkg) {
      setSessionType(pkg.sessionType ?? "individual");
      setName(pkg.name);
      setDescription(pkg.description ?? "");
      setSessionCount(String(pkg.sessionCount));
      setSessionDurationMins(pkg.sessionDurationMins ? String(pkg.sessionDurationMins) : "");
      setPrice(pkg.price);
      setCurrency(pkg.currency);
      setValidityDays(pkg.validityDays ? String(pkg.validityDays) : "");
      setIsPublic(pkg.isPublic ?? true);
      setIsFreeTrialSession(pkg.isFreeTrialSession ?? false);
      setAllowSelfBook(pkg.allowSelfBook ?? true);
    } else {
      setSessionType("individual");
      setName("");
      setDescription("");
      setSessionCount("10");
      setSessionDurationMins("");
      setPrice("");
      setCurrency(defaultCurrency);
      setValidityDays("");
      setIsPublic(true);
      setIsFreeTrialSession(false);
      setAllowSelfBook(true);
    }
    setError("");
  }, [pkg, open, defaultCurrency]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = isEdit ? `/api/packages/${pkg!.id}` : "/api/packages";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          name,
          description,
          sessionCount,
          sessionDurationMins: sessionDurationMins || null,
          price: isFreeTrialSession ? "0" : price,
          currency,
          validityDays: validityDays || null,
          sessionType,
          isPublic,
          isFreeTrialSession,
          allowSelfBook,
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
    if (!pkg) return;
    setLoading(true);
    try {
      await fetch(`/api/packages/${pkg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pkg.isActive }),
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
          <DialogTitle>{isEdit ? "Edit Package" : "Create Package"}</DialogTitle>
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
            <Label htmlFor="pkgName">Name *</Label>
            <Input
              id="pkgName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 10-Session Bundle"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pkgDesc">Description</Label>
            <Input
              id="pkgDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sessionCount">Sessions *</Label>
              <Input
                id="sessionCount"
                type="number"
                min="1"
                value={sessionCount}
                onChange={(e) => setSessionCount(e.target.value)}
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
            <div className="space-y-1">
              <Label htmlFor="pkgPrice">Price *</Label>
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
                  id="pkgPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={isFreeTrialSession ? "0" : price}
                  onChange={(e) => { if (!isFreeTrialSession) setPrice(e.target.value); }}
                  placeholder="500.00"
                  required
                  disabled={isFreeTrialSession}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="validityDays">Validity (days, blank = no expiry)</Label>
            <Input
              id="validityDays"
              type="number"
              min="1"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              placeholder="e.g. 365"
            />
          </div>

          {/* Free trial toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-gray-900">Free Trial Session</p>
              <p className="text-xs text-gray-500">Price is set to $0 — for introductory sessions.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !isFreeTrialSession;
                setIsFreeTrialSession(next);
                if (next) setPrice("0");
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isFreeTrialSession ? "bg-green-500" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isFreeTrialSession ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Self-booking toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-gray-900">Allow Self-Booking</p>
              <p className="text-xs text-gray-500">
                {allowSelfBook ? "Clients can book sessions themselves via the portal." : "Only you can schedule sessions for this package."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAllowSelfBook((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${allowSelfBook ? "bg-indigo-600" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${allowSelfBook ? "translate-x-5" : "translate-x-0"}`} />
            </button>
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
            {isPublic ? "Clients can see and purchase this package in the portal." : "Only you can assign this package — clients won't see it."}
          </p>

          {!isEdit && (
            <p className="text-xs text-gray-500">
              A Stripe product and price will be created automatically.
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Package"}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleActive}
                disabled={loading}
              >
                {pkg?.isActive ? "Deactivate" : "Activate"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
