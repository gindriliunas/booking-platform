"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Package as PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PackageDialog } from "@/components/packages/package-dialog";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { formatCurrency } from "@/lib/utils";

const PROVIDER_ID = process.env.NEXT_PUBLIC_DEMO_PROVIDER_ID ?? "";

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
  sessionType?: "individual" | "group";
  createdAt: string;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [providerCurrency, setProviderCurrency] = useState("usd");

  useEffect(() => {
    fetch(`/api/providers?providerId=${PROVIDER_ID}`)
      .then((r) => r.json())
      .then((d) => { if (d.provider?.currency) setProviderCurrency(d.provider.currency); })
      .catch(() => {});
  }, []);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/packages?providerId=${PROVIDER_ID}`);
      const data = await res.json();
      setPackages(data.packages ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  function handleSuccess() {
    setDialogOpen(false);
    setEditPkg(null);
    fetchPackages();
  }

  const active = packages.filter((p) => p.isActive);
  const inactive = packages.filter((p) => !p.isActive);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="mt-1 text-sm text-gray-500">
            {active.length} active · {inactive.length} inactive
          </p>
        </div>
        <Button onClick={() => { setEditPkg(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Package
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading packages…</div>
      ) : packages.length === 0 ? (
        <div className="text-sm text-gray-500 py-8 text-center">
          No packages yet. Create one to start selling sessions.
        </div>
      ) : (
        <div className="space-y-3">
          {[...active, ...inactive].map((pkg) => (
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
                    onClick={() => { setEditPkg(pkg); setDialogOpen(true); }}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PackageDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditPkg(null); }}
        providerId={PROVIDER_ID}
        defaultCurrency={providerCurrency}
        pkg={editPkg}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
