import Link from "next/link";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: `VIV-Z is a GoHighLevel Marketplace app that adds full-featured session and booking management to your GHL sub-account. It is built on Next.js, uses Stripe for payments, and syncs contacts and workflow triggers with GHL in real time.`,
  },
  {
    id: "architecture",
    title: "Architecture",
    content: `VIV-Z is a multi-tenant SaaS app. Each GHL sub-account that installs VIV-Z becomes an independent tenant (called a "provider"). Provider data, client records, bookings, packages, and subscriptions are all isolated per tenant.`,
    bullets: [
      "Authentication: Clerk (provider dashboard) + custom auth (client portal)",
      "Database: PostgreSQL via Neon Serverless",
      "ORM: Drizzle",
      "Payments: Stripe (checkout, webhooks, subscriptions)",
      "Emails / reminders: Resend",
      "GHL sync: OAuth 2.0 + REST API + webhooks",
    ],
  },
  {
    id: "installation",
    title: "Installing VIV-Z",
    content: `Install VIV-Z directly from the GoHighLevel Marketplace. The OAuth flow connects your GHL sub-account to VIV-Z automatically.`,
    steps: [
      "Open GoHighLevel and navigate to the Marketplace.",
      'Search for "VIV-Z" and click Install.',
      "Authorize the OAuth connection when prompted.",
      "You will be redirected to the VIV-Z setup wizard.",
      "Complete the setup wizard to configure your first availability slot.",
    ],
  },
  {
    id: "providers",
    title: "Provider Dashboard",
    content:
      "After installation, you access the provider dashboard to manage all aspects of your service business.",
    bullets: [
      "Calendar — view, create, and edit individual and group bookings",
      "Clients — invite clients, view profiles, and manage package balances",
      "Packages — create session bundles with a fixed number of sessions and a price",
      "Subscriptions — set up recurring billing plans that renew monthly",
      "Questionnaires — build custom intake forms and assign them to clients",
      "Settings — configure your Stripe account, notification preferences, and GHL sync",
    ],
  },
  {
    id: "client-portal",
    title: "Client Portal",
    content:
      "Every provider gets a hosted client portal at /portal. Share this URL with your clients so they can book, pay, and manage their account.",
    bullets: [
      "Clients sign up with email and OTP — no password required",
      "Browse and purchase packages or subscribe to a plan",
      "View live availability and book sessions",
      "See upcoming and past sessions",
      "Submit questionnaire responses",
      "Update their profile",
    ],
  },
  {
    id: "ghl-sync",
    title: "GoHighLevel Sync",
    content:
      "VIV-Z connects to GHL via OAuth and keeps contact data and custom field values in sync.",
    bullets: [
      "When a client books their first session, VIV-Z creates or updates the corresponding GHL contact",
      "Tags are applied based on booking status (e.g. active-client, completed)",
      "You can configure GHL workflow triggers to fire on booking events (created, completed, cancelled)",
      "Webhook events from GHL (contact updates, tag changes) are received and processed in real time",
    ],
  },
  {
    id: "payments",
    title: "Stripe & Payments",
    content:
      "VIV-Z uses Stripe for all payment processing. You must connect your own Stripe account in the Settings page.",
    bullets: [
      "One-time checkout for packages",
      "Recurring subscription billing managed by Stripe",
      "Webhook-driven status updates — no polling",
      "Clients receive Stripe-generated receipts automatically",
      "Refunds and cancellations can be managed from the Stripe dashboard",
    ],
  },
  {
    id: "reminders",
    title: "Automated Reminders",
    content:
      "VIV-Z automatically sends session reminders 24 hours before each scheduled session via email (Resend). No manual action required.",
  },
  {
    id: "api",
    title: "Internal API",
    content:
      "VIV-Z exposes a set of internal REST API routes used by the dashboard and portal. These are not intended for external consumption but are documented here for transparency.",
    bullets: [
      "GET/POST /api/bookings — list and create bookings",
      "GET/PUT/DELETE /api/bookings/[id] — single booking management",
      "GET/POST /api/packages — packages CRUD",
      "GET/POST /api/clients — client management",
      "POST /api/portal/book — client-facing booking endpoint",
      "POST /api/stripe/webhook — Stripe event handler",
      "POST /api/connect/webhook — event handler",
      "GET /api/connect/callback — OAuth callback",
      "POST /api/cron/reminders — reminder cron trigger",
    ],
  },
];

export const metadata = {
  title: "Documentation — VIV-Z",
  description: "Technical documentation for the VIV-Z booking and session management platform.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex gap-12">
          {/* Sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24 space-y-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                On this page
              </p>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded px-3 py-1.5 text-sm text-gray-600 transition hover:bg-violet-50 hover:text-violet-700"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1">
            <div className="mb-10">
              <span className="mb-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                Documentation
              </span>
              <h1 className="text-4xl font-black text-gray-900">VIV-Z Docs</h1>
              <p className="mt-3 text-lg text-gray-500">
                Everything you need to install, configure, and run VIV-Z.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/getting-started"
                  className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
                >
                  Getting Started Guide →
                </Link>
                <Link
                  href="/support"
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-violet-300"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            <div className="space-y-14">
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="mb-3 text-2xl font-black text-gray-900">
                    {s.title}
                  </h2>
                  <p className="mb-4 text-gray-600 leading-relaxed">{s.content}</p>
                  {s.bullets && (
                    <ul className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="mt-0.5 text-violet-500">•</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.steps && (
                    <ol className="space-y-3">
                      {s.steps.map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                            {i + 1}
                          </span>
                          <span className="pt-0.5 text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
