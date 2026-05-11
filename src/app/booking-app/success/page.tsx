import Link from "next/link";
import { MarketingSiteHeader } from "@/components/marketing/site-header";

export const metadata = {
  title: "Bookings App activated — VIV-Z",
};

const steps = [
  "We'll set up your booking portal on your website domain (usually within a few hours)",
  "You'll receive an email with your login credentials and a setup guide",
  "Connect your Stripe account in one click so client payments go directly to you",
  "Share your booking link — add it to your website, Instagram bio, or email signature",
];

export default function BookingAppSuccessPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0b", color: "#f5f5f7" }}>
      <MarketingSiteHeader />

      <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-28 text-center">
        {/* Icon */}
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
          Bookings App
          <br />
          <span style={{ color: "#ff5b04" }}>activated.</span>
        </h1>
        <p className="mt-4 leading-relaxed" style={{ color: "rgba(245,245,247,0.5)", fontSize: "1.05rem", maxWidth: "42ch" }}>
          Payment confirmed. We&apos;re setting up your booking portal now — check your inbox shortly.
        </p>

        <div
          className="mt-12 w-full rounded-2xl p-7 text-left"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
        >
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(245,245,247,0.3)" }}>
            What happens next
          </p>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4 text-sm" style={{ color: "rgba(245,245,247,0.55)" }}>
                <span
                  style={{
                    flexShrink: 0, width: 24, height: 24, borderRadius: "50%",
                    background: "rgba(255,91,4,0.15)", color: "#ff5b04",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ lineHeight: 1.65, paddingTop: 2 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-col gap-3 w-full sm:flex-row">
          <Link
            href="/dashboard"
            className="flex-1 rounded-full py-3.5 text-center text-sm font-bold text-white transition-all hover:brightness-110"
            style={{ background: "#ff5b04" }}
          >
            Go to dashboard →
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-full py-3.5 text-center text-sm font-semibold transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(245,245,247,0.5)" }}
          >
            Back to homepage
          </Link>
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
