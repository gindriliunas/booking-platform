"use client";

import { useState } from "react";

const ACCENT = "#ff5b04";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED  = "rgba(245,245,247,0.45)";

export function UpgradeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/website-service/booking-app-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="rounded-2xl p-7 space-y-5"
        style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.025)" }}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium" style={{ color: MUTED }}>
            Email address on your VIV-Z subscription
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5b04] transition-all duration-300 placeholder:text-[rgba(245,245,247,0.2)]"
            style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.1)", color: "#f5f5f7" }}
          />
        </label>

        {/* What they'll be charged */}
        <div className="rounded-xl px-4 py-3 flex items-center justify-between text-sm" style={{ background: `${ACCENT}0d`, border: `1px solid ${ACCENT}25` }}>
          <span style={{ color: MUTED }}>Added to your existing subscription</span>
          <span className="font-bold" style={{ color: ACCENT }}>+£5/month</span>
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full py-4 text-sm font-bold text-white transition-all duration-500 hover:scale-[1.02] hover:brightness-110 disabled:opacity-50 disabled:scale-100"
          style={{ background: ACCENT }}
        >
          {loading ? "Looking up your account…" : "Add Bookings App — £5/month →"}
        </button>
      </div>

      <p className="text-center text-xs" style={{ color: "rgba(245,245,247,0.2)" }}>
        You&apos;ll be taken to Stripe to complete the upgrade · Cancel anytime
      </p>
    </form>
  );
}
