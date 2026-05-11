import Link from "next/link";
import { MarketingSiteHeader } from "@/components/marketing/site-header";

export const metadata = {
  title: "We're building your website — VIV-Z",
};

export default function GetAWebsiteSuccessPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0b", color: "#f5f5f7" }}>
      <MarketingSiteHeader />

      <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-28 text-center">
        {/* Check icon */}
        <div
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "rgba(255,91,4,0.12)", border: "1px solid rgba(255,91,4,0.3)" }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16.5L12.5 23L26 10" stroke="#ff5b04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#f5f5f7" }}
        >
          We&apos;re on it.
        </h1>
        <p className="mt-4 leading-relaxed" style={{ color: "rgba(245,245,247,0.5)", fontSize: "1.1rem", maxWidth: "40ch" }}>
          Your website is being built. You&apos;ll receive a link to your live
          preview within 24 hours — check your inbox.
        </p>

        <div
          className="mt-12 w-full rounded-2xl p-7 text-left"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
        >
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(245,245,247,0.3)" }}>
            What happens next
          </p>
          <ol className="space-y-4">
            {[
              "We build your custom website (usually within 24 hours)",
              "You receive an email with a live preview link",
              "Browse it on any device — no login needed",
              "If you love it, activate for £24/month and connect your domain",
            ].map((step, i) => (
              <li key={i} className="flex gap-4 text-sm" style={{ color: "rgba(245,245,247,0.55)" }}>
                <span
                  style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(255,91,4,0.15)", color: "#ff5b04", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}
                >
                  {i + 1}
                </span>
                <span style={{ lineHeight: 1.6, paddingTop: 2 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-8 text-sm" style={{ color: "rgba(245,245,247,0.25)" }}>
          Questions?{" "}
          <Link href="/contact" className="underline underline-offset-2 hover:text-[#f5f5f7] transition-colors" style={{ color: "#ff5b04" }}>
            Contact us
          </Link>
        </p>
      </main>
    </div>
  );
}
