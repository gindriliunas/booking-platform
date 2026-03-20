"use client";

import { useState } from "react";
import { Link, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  providerId: string;
  type: "package" | "subscription";
  itemId: string;
  hasStripePrice: boolean;
}

export function CopyLinkButton({ providerId, type, itemId, hasStripePrice }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/pay/${providerId}/${type}/${itemId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!hasStripePrice) {
    return (
      <Button variant="outline" size="sm" disabled title="No Stripe price linked">
        <Link className="h-3.5 w-3.5 mr-1.5" />
        Copy link
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Link className="h-3.5 w-3.5 mr-1.5" />
          Copy link
        </>
      )}
    </Button>
  );
}
