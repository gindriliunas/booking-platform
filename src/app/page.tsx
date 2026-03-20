import Link from "next/link";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { VivZLogo } from "@/components/marketing/logo";

const features = [
  {
    icon: "📅",
    title: "Smart Scheduling",
    description:
      "Set your availability once. Clients book sessions that fit both your calendar and theirs — no back-and-forth.",
  },
  {
    icon: "👥",
    title: "1-on-1 & Group Sessions",
    description:
      "Manage individual appointments and group classes from a single dashboard with real-time participant tracking.",
  },
  {
    icon: "💳",
    title: "Packages & Subscriptions",
    description:
      "Sell session bundles and recurring subscription plans. Clients redeem sessions from their package balance automatically.",
  },
  {
    icon: "📋",
    title: "Client Questionnaires",
    description:
      "Send intake forms and health questionnaires before the first session. Responses are stored against each client profile.",
  },
  {
    icon: "💰",
    title: "Stripe Payments",
    description:
      "Secure checkout for packages and subscriptions. Automated billing, receipts, and webhook-driven status updates.",
  },
  {
    icon: "🔔",
    title: "Automated Reminders",
    description:
      "Cron-based SMS and email reminders fire 24 hours before each session — reducing no-shows without manual effort.",
  },
  {
    icon: "🔗",
    title: "GoHighLevel Integration",
    description:
      "Native GHL marketplace app. Contacts, tags, and workflow triggers sync in real time with your GHL sub-account.",
  },
  {
    icon: "📱",
    title: "Client Portal",
    description:
      "A white-label booking portal your clients use to book, view their history, pay, and submit questionnaires.",
  },
];

const benefits = [
  {
    title: "Zero scheduling friction",
    description:
      "Replace manual calendar juggling with a self-service portal. Your clients see live availability and book instantly.",
    stat: "10×",
    statLabel: "faster booking",
  },
  {
    title: "Revenue on autopilot",
    description:
      "Packages and subscriptions mean money in before the session happens. No more chasing invoices after the fact.",
    stat: "↑ 40%",
    statLabel: "avg. revenue per client",
  },
  {
    title: "Lives inside your GHL",
    description:
      "VIV-Z is a certified GoHighLevel marketplace app. Installation takes two clicks — no third-party login or CRM migration needed.",
    stat: "2 clicks",
    statLabel: "to install",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 px-6 py-24 text-white md:py-36">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-violet-400 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <VivZLogo size="xl" className="[&_span]:text-white [&_svg_polygon:first-child]:fill-white/20 [&_svg_polygon:last-child]:fill-white/10" />
          </div>
          <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Session & Booking Management
            <br />
            <span className="text-violet-300">Powered by GoHighLevel</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-violet-200 md:text-xl">
            The all-in-one platform for personal trainers, therapists, and
            service professionals. Manage bookings, packages, payments, and
            clients — all inside your existing GHL workflow.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/install"
              className="rounded-xl bg-white px-8 py-4 text-base font-bold text-violet-800 shadow-lg transition hover:bg-violet-50"
            >
              Install on GoHighLevel →
            </Link>
            <Link
              href="/getting-started"
              className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-black md:text-4xl">
              Why VIV-Z?
            </h2>
            <p className="text-lg text-gray-500">
              Built specifically for GHL users who want more from their booking
              workflow.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                <div className="mb-2 text-4xl font-black text-violet-700">
                  {b.stat}
                </div>
                <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-violet-400">
                  {b.statLabel}
                </div>
                <h3 className="mb-2 text-xl font-bold">{b.title}</h3>
                <p className="text-gray-500">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-black md:text-4xl">
              Everything you need
            </h2>
            <p className="text-lg text-gray-500">
              From the first booking to recurring revenue — VIV-Z handles the
              entire client lifecycle.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md"
              >
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-2 font-bold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GHL Integration */}
      <section className="bg-gradient-to-br from-gray-900 to-violet-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="mb-4 inline-block rounded-full bg-violet-500/20 px-4 py-1 text-sm font-semibold text-violet-300">
                Native GHL Integration
              </span>
              <h2 className="mb-6 text-3xl font-black leading-tight md:text-4xl">
                Works inside GoHighLevel.
                <br />
                <span className="text-violet-300">Not alongside it.</span>
              </h2>
              <p className="mb-8 text-gray-300">
                VIV-Z is available on the GoHighLevel Marketplace. Install it
                directly from your GHL sub-account. Your contacts, workflows,
                and automations stay in sync automatically.
              </p>
              <ul className="space-y-3 text-sm text-gray-300">
                {[
                  "OAuth connection — no passwords shared",
                  "Contact data synced to GHL on booking",
                  "Trigger GHL workflows on session events",
                  "Works in every GHL sub-account",
                  "Webhook-driven — always up to date",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-violet-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-violet-400">
                Workflow trigger example
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Trigger", value: "New booking created" },
                  { label: "Action 1", value: "Add tag: active-client" },
                  { label: "Action 2", value: "Send welcome SMS" },
                  { label: "Action 3", value: "Enroll in nurture sequence" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2"
                  >
                    <span className="text-gray-400">{row.label}</span>
                    <span className="font-medium text-white">{row.value}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/getting-started"
                className="mt-6 block w-full rounded-lg bg-violet-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Set up your first workflow →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-black md:text-4xl">
            Ready to streamline your sessions?
          </h2>
          <p className="mb-8 text-lg text-gray-500">
            Install VIV-Z from the GoHighLevel Marketplace in under 2 minutes.
            No credit card required to get started.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/install"
              className="rounded-xl bg-violet-700 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-violet-800"
            >
              Install on GoHighLevel →
            </Link>
            <Link
              href="/docs"
              className="rounded-xl border border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 transition hover:border-violet-300 hover:text-violet-700"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
