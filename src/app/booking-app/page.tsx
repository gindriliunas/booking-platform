import Link from "next/link";
import { VivZWordmark } from "@/components/marketing/logo";
import { HeroSpotlight, HeroBgBlobs } from "@/components/marketing/hero-interactive";
import { Tilt } from "@/components/marketing/tilt";
import { CustomCursor } from "@/components/marketing/cursor";
import { UpgradeForm } from "./upgrade-form";

const INK    = "#0a0a0b";
const PAPER  = "#f5f5f7";
const ACCENT = "#ff5b04";
const MUTED  = "rgba(245,245,247,0.45)";
const BORDER = "rgba(255,255,255,0.08)";

const features = [
  {
    num: "01",
    title: "Client self-booking portal",
    desc: "Your clients get a branded portal where they can book sessions, view their packages, and manage their profile — without calling you.",
    icon: "⟶",
  },
  {
    num: "02",
    title: "Calendar & availability",
    desc: "Set your working hours, block off time, and manage every booking from one clean calendar view. Group sessions and one-to-ones in one place.",
    icon: "◻",
  },
  {
    num: "03",
    title: "Packages & subscriptions",
    desc: "Sell session bundles or recurring monthly plans. Stripe handles the payments — you just deliver the sessions.",
    icon: "◈",
  },
  {
    num: "04",
    title: "Group classes",
    desc: "Run group sessions with capacity limits, waitlists, and automatic spot allocation when someone cancels.",
    icon: "◇",
  },
  {
    num: "05",
    title: "Intake questionnaires",
    desc: "Send new clients a custom intake form before their first session. Collect health info, goals, or anything you need.",
    icon: "▷",
  },
  {
    num: "06",
    title: "Automated reminders",
    desc: "Email reminders go out automatically before every session. Fewer no-shows, less chasing.",
    icon: "◎",
  },
  {
    num: "07",
    title: "Google Calendar sync",
    desc: "Two-way sync with your Google Calendar. Every booking appears in your personal calendar automatically.",
    icon: "⊕",
  },
  {
    num: "08",
    title: "Stripe payments built in",
    desc: "Accept card payments online. Packages, subscriptions, and single sessions — all handled securely through Stripe.",
    icon: "◐",
  },
];

const faqs = [
  {
    q: "Do I need the website to use the Bookings App?",
    a: "Yes — the Bookings App is an add-on for existing VIV-Z website subscribers. Your booking portal is hosted on your website domain.",
  },
  {
    q: "What does my client see?",
    a: "Clients get a clean portal at your domain where they can view your availability, book sessions, manage their packages, and complete intake forms.",
  },
  {
    q: "Do I need a Stripe account?",
    a: "Yes — you'll connect your own Stripe account so payments go directly to you. We never touch your money.",
  },
  {
    q: "Can I run group classes?",
    a: "Yes. Set a capacity, open bookings, and the system handles waitlists and automatic spot allocation automatically.",
  },
  {
    q: "What happens if I cancel?",
    a: "Cancel anytime. Your website stays live at £24/month — only the Bookings App addon stops.",
  },
  {
    q: "How quickly can I get started?",
    a: "Within a few hours of upgrading we'll set up your portal and send you a setup guide. Most trainers are taking bookings the same day.",
  },
];

const steps = [
  { num: "01", title: "Upgrade for £5/month", desc: "Enter your email below. We add the Bookings App to your existing subscription — your next invoice increases by £5." },
  { num: "02", title: "We set up your portal", desc: "We configure your booking portal on your existing domain and send you login credentials." },
  { num: "03", title: "Connect your Stripe account", desc: "Link the app to your Stripe account in one click so client payments land directly in your bank." },
  { num: "04", title: "Share your booking link", desc: "Add your booking link to your website, Instagram bio, or email signature. Clients can book instantly." },
];

export default function BookingAppPage() {
  return (
    <div style={{ background: INK, color: PAPER, overflowX: "hidden" }}>
      <CustomCursor />

      {/* SVG noise */}
      <svg style={{ position: "fixed", width: 0, height: 0 }}>
        <defs>
          <filter id="ba-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div style={{ position: "fixed", inset: 0, filter: "url(#ba-noise)", opacity: 0.032, pointerEvents: "none", zIndex: 9998, mixBlendMode: "overlay" }} />

      <HeroSpotlight />

      {/* ── NAV ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-xl"
        style={{ borderBottom: `1px solid ${BORDER}`, background: "rgba(10,10,11,0.85)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="VIV-Z Home" className="opacity-90 hover:opacity-100 transition-opacity duration-300">
            <VivZWordmark size="sm" />
          </Link>
          <a
            href="#upgrade"
            className="rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all duration-500 hover:scale-105 hover:brightness-110"
            style={{ background: ACCENT }}
          >
            Add to my website
          </a>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden px-6 pt-24 pb-20 flex items-center">
        <HeroBgBlobs />

        {/* Spinning ring */}
        <div className="pointer-events-none absolute" style={{ top: "10%", right: "6%", width: 200, height: 200, opacity: 0.05 }}>
          <div className="spin-slow" style={{ width: "100%", height: "100%", border: `1px solid ${ACCENT}`, borderRadius: "40% 60% 60% 40% / 40% 40% 60% 60%" }} />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="max-w-3xl">
            <p className="hero-eyebrow mb-8 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: "rgba(245,245,247,0.3)" }}>
              Bookings App Add-on
            </p>

            <h1
              className="hero-h1"
              style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92, color: PAPER }}
            >
              Your complete
              <br />
              <span style={{ color: ACCENT }}>booking system.</span>
            </h1>

            <p
              className="hero-sub mt-8 font-light leading-relaxed"
              style={{ fontSize: "clamp(1.05rem, 1.6vw, 1.3rem)", color: MUTED, maxWidth: "52ch" }}
            >
              Add the full VIV-Z bookings platform to your website — client portal,
              calendar, Stripe payments, group classes, and more. One click upgrade
              for existing website subscribers.
            </p>

            <div className="hero-cta mt-12 flex flex-wrap items-center gap-5">
              <a
                href="#upgrade"
                className="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-bold text-white transition-all duration-500 hover:gap-5 hover:scale-[1.03] hover:brightness-110"
                style={{ background: ACCENT }}
              >
                Add to my website
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
              <span className="text-sm font-semibold" style={{ color: "rgba(245,245,247,0.4)" }}>
                +£5/month · cancel anytime
              </span>
            </div>

            {/* Price callout */}
            <div className="hero-stats mt-20 flex flex-wrap gap-10">
              {[
                { value: "£5", label: "per month extra" },
                { value: "8+", label: "features included" },
                { value: "24h", label: "setup time" },
              ].map((s) => (
                <div key={s.label}>
                  <p style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em", color: PAPER, lineHeight: 1 }}>
                    {s.value}
                  </p>
                  <p className="mt-1.5 text-xs uppercase tracking-[0.2em]" style={{ color: "rgba(245,245,247,0.3)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-5"
        style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: "rgba(255,91,4,0.03)" }}
      >
        <div className="marquee-track flex w-max gap-14 whitespace-nowrap">
          {[
            "Client self-booking", "Stripe payments", "Group classes", "Waitlists",
            "Intake forms", "Email reminders", "Google Calendar sync", "Packages & subscriptions",
            "Cancellation management", "Session history", "Client portal", "Automated invoices",
            ...["Client self-booking", "Stripe payments", "Group classes", "Waitlists",
              "Intake forms", "Email reminders", "Google Calendar sync", "Packages & subscriptions",
              "Cancellation management", "Session history", "Client portal", "Automated invoices"],
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-14">
              <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "rgba(245,245,247,0.35)" }}>{item}</span>
              <span style={{ color: `${ACCENT}55`, fontSize: "0.35rem" }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="px-6 py-32" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-20">
            <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>What's included</p>
            <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: PAPER }}>
              Everything you need
              <br />
              <span style={{ color: "rgba(245,245,247,0.25)" }}>to run your bookings.</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Tilt
                key={f.num}
                className={`reveal${i > 0 ? `-delay-${Math.min(i % 4 + 1, 3)}` : ""}`}
                style={{ borderRadius: 18, border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)", cursor: "default" }}
              >
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-bold tracking-[0.35em]" style={{ color: `${ACCENT}55` }}>{f.num}</p>
                    <span style={{ fontSize: "1.1rem", color: `${ACCENT}66` }}>{f.icon}</span>
                  </div>
                  <h3 className="mb-2" style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.02em", color: PAPER }}>{f.title}</h3>
                  <p style={{ fontSize: "0.83rem", color: MUTED, lineHeight: 1.75 }}>{f.desc}</p>
                </div>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="px-6 py-32" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-20">
            <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>Getting started</p>
            <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: PAPER }}>
              Up and running
              <br />
              <span style={{ color: "rgba(245,245,247,0.25)" }}>in hours.</span>
            </h2>
          </div>

          <div className="grid gap-px sm:grid-cols-2" style={{ background: BORDER }}>
            {steps.map((step, i) => (
              <Tilt
                key={step.num}
                intensity={3}
                className={`reveal${i > 0 ? `-delay-${Math.min(i, 3)}` : ""}`}
                style={{ background: INK, borderRadius: 0, cursor: "default" }}
              >
                <div className="flex gap-7 p-8 md:p-10 transition-colors duration-500 hover:bg-white/[0.025]">
                  <span style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.05em", color: `${ACCENT}22`, lineHeight: 1, flexShrink: 0 }}>
                    {step.num}
                  </span>
                  <div className="pt-1">
                    <h3 className="mb-2" style={{ fontSize: "clamp(1rem, 1.6vw, 1.3rem)", fontWeight: 700, letterSpacing: "-0.02em", color: PAPER }}>{step.title}</h3>
                    <p style={{ color: MUTED, lineHeight: 1.75, fontSize: "0.9rem" }}>{step.desc}</p>
                  </div>
                </div>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-32" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>Pricing</p>
            <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: PAPER }}>
              Simple add-on pricing.
            </h2>
          </div>

          <div className="reveal grid gap-5 sm:grid-cols-2 max-w-2xl mx-auto">
            {/* Website only */}
            <Tilt
              intensity={4}
              style={{ borderRadius: 22, border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)", cursor: "default" }}
            >
              <div className="p-8">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(245,245,247,0.3)" }}>Website only</p>
                <div className="mb-1 flex items-baseline gap-2">
                  <span style={{ fontSize: "3.5rem", fontWeight: 900, letterSpacing: "-0.05em", color: PAPER, lineHeight: 1 }}>£24</span>
                  <span style={{ color: MUTED }}>/month</span>
                </div>
                <p className="mb-6 text-xs" style={{ color: "rgba(245,245,247,0.3)" }}>Professional website · hosting · SSL · domain</p>
                <ul className="space-y-2.5 text-sm" style={{ color: MUTED }}>
                  {["Custom website design", "Edge hosting globally", "SSL certificate", "Domain connected", "SEO optimised"].map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span style={{ color: ACCENT }}>✓</span>{i}
                    </li>
                  ))}
                </ul>
              </div>
            </Tilt>

            {/* Website + Bookings */}
            <Tilt
              intensity={4}
              style={{
                borderRadius: 22,
                border: `1px solid ${ACCENT}44`,
                background: `linear-gradient(135deg, rgba(255,91,4,0.07) 0%, rgba(255,255,255,0.02) 100%)`,
                cursor: "default",
              }}
            >
              <div className="p-8">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>Website + Bookings</p>
                  <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${ACCENT}20`, color: ACCENT }}>Popular</span>
                </div>
                <div className="mb-1 flex items-baseline gap-2">
                  <span style={{ fontSize: "3.5rem", fontWeight: 900, letterSpacing: "-0.05em", color: PAPER, lineHeight: 1 }}>£29</span>
                  <span style={{ color: MUTED }}>/month</span>
                </div>
                <p className="mb-6 text-xs" style={{ color: "rgba(245,245,247,0.3)" }}>Everything in Website + full Bookings App</p>
                <ul className="space-y-2.5 text-sm" style={{ color: MUTED }}>
                  {[
                    "Everything in Website",
                    "Client self-booking portal",
                    "Calendar management",
                    "Packages & subscriptions",
                    "Group classes & waitlists",
                    "Stripe payments",
                    "Intake questionnaires",
                    "Automated reminders",
                    "Google Calendar sync",
                  ].map((item, i) => (
                    <li key={item} className="flex items-center gap-2">
                      <span style={{ color: i === 0 ? MUTED : ACCENT }}>{i === 0 ? "↳" : "✓"}</span>
                      <span style={{ color: i === 0 ? "rgba(245,245,247,0.3)" : MUTED }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#upgrade"
                  className="mt-6 block w-full rounded-full py-3.5 text-center text-sm font-bold text-white transition-all duration-500 hover:brightness-110 hover:scale-[1.02]"
                  style={{ background: ACCENT }}
                >
                  Upgrade for +£5/month →
                </a>
              </div>
            </Tilt>
          </div>
        </div>
      </section>

      {/* ── UPGRADE FORM ─────────────────────────────────────── */}
      <section id="upgrade" className="relative overflow-hidden px-6 py-32" style={{ borderBottom: `1px solid ${BORDER}`, background: "#0d0d0f" }}>
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(255,91,4,0.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700, height: 400,
            background: `radial-gradient(ellipse, ${ACCENT}10 0%, transparent 65%)`,
            filter: "blur(80px)", pointerEvents: "none",
          }}
        />

        <div className="relative z-10 mx-auto max-w-xl">
          <div className="mb-12 text-center">
            <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>Upgrade</p>
            <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: PAPER }}>
              Add the Bookings App
              <br />
              <span style={{ color: "rgba(245,245,247,0.3)" }}>to your website.</span>
            </h2>
            <p className="reveal mt-4" style={{ color: MUTED, lineHeight: 1.7 }}>
              Enter the email address on your VIV-Z website subscription. We&apos;ll
              add the Bookings App for +£5/month — your next invoice will reflect the change.
            </p>
          </div>

          <UpgradeForm />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="px-6 py-32" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-16">
            <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>FAQ</p>
            <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: PAPER }}>
              Questions.
            </h2>
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}` }}>
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                className={`reveal${i > 0 ? `-delay-${Math.min(i % 3 + 1, 3)}` : ""} py-7`}
                style={{ borderBottom: `1px solid ${BORDER}` }}
              >
                <h3 className="mb-3" style={{ fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.01em", color: PAPER }}>{faq.q}</h3>
                <p style={{ color: MUTED, lineHeight: 1.8, fontSize: "0.92rem", maxWidth: "68ch" }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-36 text-center" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div
          style={{
            position: "absolute", bottom: "-20%", left: "50%",
            transform: "translateX(-50%)",
            width: 600, height: 400,
            background: `radial-gradient(ellipse, ${ACCENT}12 0%, transparent 70%)`,
            filter: "blur(80px)", pointerEvents: "none",
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="reveal" style={{ fontSize: "clamp(2.2rem, 6vw, 5.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, color: PAPER }}>
            Start taking bookings
            <br />
            <span style={{ color: ACCENT }}>today.</span>
          </h2>
          <p className="reveal mt-6" style={{ color: MUTED, maxWidth: "46ch", margin: "1.5rem auto 0", lineHeight: 1.7 }}>
            Add the Bookings App to your website for just £5 extra per month.
            Cancel anytime.
          </p>
          <div className="reveal mt-10">
            <a
              href="#upgrade"
              className="inline-flex items-center gap-3 rounded-full px-10 py-5 text-base font-black text-white transition-all duration-500 hover:scale-[1.04] hover:brightness-110"
              style={{ background: ACCENT }}
            >
              Upgrade for +£5/month →
            </a>
          </div>
          <p className="reveal mt-4 text-xs" style={{ color: "rgba(245,245,247,0.2)" }}>
            Existing website subscribers only · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="px-6 py-10" style={{ borderTop: `1px solid ${BORDER}`, background: "#060607" }}>
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between text-sm" style={{ color: "rgba(245,245,247,0.3)" }}>
          <Link href="/" className="hover:text-[#f5f5f7] transition-colors">← Back to VIV-Z</Link>
          <p className="text-xs" style={{ color: "rgba(245,245,247,0.18)" }}>© {new Date().getFullYear()} VIV-Z. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
