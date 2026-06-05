"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ClaimPackageButton({
  packageId,
  label = "Claim",
}: {
  packageId: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/claim-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button type="button" size="sm" onClick={handleClick} disabled={loading}>
        {loading ? "…" : label}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
