"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Package, Repeat, AlertCircle } from "lucide-react";

interface ItemDetails {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  currency: string;
  sessionCount?: number;
  sessionsPerPeriod?: number;
  billingPeriod?: string;
  validityDays?: number | null;
  stripePriceId?: string | null;
}

interface ProviderDetails {
  name: string;
  serviceType?: string | null;
}

export default function PayPage() {
  const { providerId, type, itemId } = useParams<{
    providerId: string;
    type: string;
    itemId: string;
  }>();

  const [provider, setProvider] = useState<ProviderDetails | null>(null);
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const itemEndpoint =
          type === "package"
            ? `/api/packages?providerId=${providerId}`
            : `/api/subscriptions?providerId=${providerId}`;

        const [provRes, itemRes] = await Promise.all([
          fetch(`/api/providers?providerId=${providerId}`),
          fetch(itemEndpoint),
        ]);

        const provData = await provRes.json();
        if (!provData.provider) throw new Error("Provider not found");
        setProvider({ name: provData.provider.name, serviceType: provData.provider.serviceType });

        const itemData = await itemRes.json();
        const list: ItemDetails[] =
          type === "package" ? (itemData.packages ?? []) : (itemData.plans ?? []);
        const found = list.find((i) => i.id === itemId);
        if (!found) throw new Error(`${type === "package" ? "Package" : "Plan"} not found`);
        setItem(found);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [providerId, type, itemId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/stripe/public-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, type, itemId, clientName: name, clientEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Loading…
      </div>
    );
  }

  if (loadError || !provider || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="text-sm text-red-600">{loadError || "Not found"}</p>
        </div>
      </div>
    );
  }

  const isPackage = type === "package";
  const priceLabel = isPackage
    ? formatCurrency(item.price, item.currency)
    : `${formatCurrency(item.price, item.currency)}/${(item.billingPeriod ?? "monthly").replace("ly", "")}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
          {provider.serviceType && (
            <p className="mt-1 text-sm text-gray-500">{provider.serviceType}</p>
          )}
        </div>

        {/* Item details */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-2.5 shrink-0 ${isPackage ? "bg-orange-50" : "bg-purple-50"}`}>
                {isPackage
                  ? <Package className="h-5 w-5 text-orange-500" />
                  : <Repeat className="h-5 w-5 text-purple-500" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <Badge variant="secondary">{isPackage ? "Package" : "Subscription"}</Badge>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  <span className="font-bold text-gray-900 text-base">{priceLabel}</span>
                  {isPackage && item.sessionCount && (
                    <span>{item.sessionCount} sessions</span>
                  )}
                  {!isPackage && item.sessionsPerPeriod && (
                    <span>
                      {item.sessionsPerPeriod} sessions/{(item.billingPeriod ?? "monthly").replace("ly", "")}
                    </span>
                  )}
                  {item.validityDays && <span>Valid {item.validityDays} days</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No Stripe price */}
        {!item.stripePriceId ? (
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Not available for online purchase</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Please contact {provider.name} directly to purchase this {isPackage ? "package" : "plan"}.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Checkout form */
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Your details</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="payName">Full name</Label>
                  <Input
                    id="payName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payEmail">Email</Label>
                  <Input
                    id="payEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {submitError && <p className="text-sm text-red-600">{submitError}</p>}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Redirecting to payment…" : `Pay ${priceLabel}`}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  You&apos;ll be redirected to Stripe to complete payment securely.
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
