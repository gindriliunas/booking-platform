import Link from "next/link";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

const steps = [
  {
    step: 1,
    title: "Install VIV-Z from the GHL Marketplace",
    description:
      "Open your GoHighLevel account and navigate to the Marketplace. Search for 'VIV-Z' and click Install. You will be prompted to authorize the OAuth connection.",
    note: "VIV-Z only requests the permissions it needs: read/write contacts, triggers, and custom fields. No billing or account-level access is requested.",
    cta: { label: "Go to install page →", href: "/install" },
  },
  {
    step: 2,
    title: "Complete the setup wizard",
    description:
      "After OAuth authorization, you will be redirected to the VIV-Z setup wizard. Enter your business name, timezone, and default session length to get started.",
    note: "You can change all of these settings later from the Settings page in your dashboard.",
  },
  {
    step: 3,
    title: "Connect your Stripe account",
    description:
      "Navigate to Settings → Payments and click 'Connect Stripe'. You will be redirected to Stripe to authorize the connection. This is required to sell packages and subscriptions.",
    note: "If you don't have a Stripe account yet, you can create one for free at stripe.com. VIV-Z uses Stripe Connect so payments go directly to your bank account.",
  },
  {
    step: 4,
    title: "Set your availability",
    description:
      "Go to Calendar → Availability and set the days and hours when you are available for bookings. Clients will only see open slots during these windows.",
    note: "You can also block specific dates or times (holidays, vacations) from the Calendar → Block Times view.",
  },
  {
    step: 5,
    title: "Create your first package or subscription",
    description:
      "Go to Packages or Subscriptions and create your first offer. A package is a fixed bundle of sessions (e.g. '10 sessions for £200'). A subscription is a recurring monthly plan.",
    note: "You can create multiple packages at different price points. Clients choose which one to purchase from the client portal.",
  },
  {
    step: 6,
    title: "Invite your first client",
    description:
      "Go to Clients and click 'Invite Client'. Enter their name and email address. They will receive an email with a link to the client portal where they can sign up, purchase a package, and book their first session.",
    note: "Clients can also find your portal directly at your VIV-Z portal URL. You can share this link on your website, in GHL emails, or on social media.",
  },
  {
    step: 7,
    title: "(Optional) Set up GHL workflow triggers",
    description:
      "In GoHighLevel, create a workflow that listens for VIV-Z custom webhook events (e.g. booking_created, session_completed). Use these triggers to send follow-up messages, apply tags, or enroll clients in nurture sequences.",
    note: "The available trigger events are documented in the Docs page. You can combine multiple triggers to build powerful automated follow-up sequences.",
    cta: { label: "Read the full docs →", href: "/docs#ghl-sync" },
  },
];

export const metadata = {
  title: "Getting Started — VIV-Z",
  description: "Step-by-step guide to setting up VIV-Z on your GoHighLevel account.",
};

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-violet-50 to-white px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <span className="mb-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            Getting Started
          </span>
          <h1 className="mb-3 text-4xl font-black text-gray-900">
            Set up VIV-Z in 7 steps
          </h1>
          <p className="text-lg text-gray-500">
            From a fresh GHL account to taking client bookings — this guide
            walks you through every step. Most users are live within 15 minutes.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/install"
              className="rounded-lg bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              Start Installation →
            </Link>
            <Link
              href="/docs"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-violet-300"
            >
              Full Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="relative space-y-10">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 h-full w-px bg-violet-100" />

            {steps.map((s) => (
              <div key={s.step} className="relative flex gap-6">
                {/* Step number */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-700 text-sm font-black text-white shadow">
                  {s.step}
                </div>

                <div className="flex-1 pb-4">
                  <h2 className="mb-2 text-xl font-black text-gray-900">
                    {s.title}
                  </h2>
                  <p className="mb-3 text-gray-600 leading-relaxed">
                    {s.description}
                  </p>
                  {s.note && (
                    <div className="rounded-lg border-l-4 border-violet-300 bg-violet-50 px-4 py-3 text-sm text-violet-800">
                      <strong>Tip:</strong> {s.note}
                    </div>
                  )}
                  {s.cta && (
                    <Link
                      href={s.cta.href}
                      className="mt-4 inline-flex items-center text-sm font-semibold text-violet-700 hover:text-violet-900"
                    >
                      {s.cta.label}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-black">What&apos;s next?</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "📖",
                title: "Full Documentation",
                desc: "Deep dive into every feature",
                href: "/docs",
              },
              {
                icon: "❓",
                title: "Support",
                desc: "Can't find what you need?",
                href: "/support",
              },
              {
                icon: "📅",
                title: "Go to Dashboard",
                desc: "Start managing your sessions",
                href: "/dashboard",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
