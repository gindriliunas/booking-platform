import Link from "next/link";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

const faqs = [
  {
    q: "How do I install VIV-Z on my GoHighLevel account?",
    a: "Go to the GoHighLevel Marketplace, search for VIV-Z, and click Install. You will be taken through a short OAuth authorization flow. The whole process takes about 2 minutes.",
  },
  {
    q: "Do my clients need a GoHighLevel account?",
    a: "No. Clients use VIV-Z's own client portal. They sign in with their email address and a one-time passcode — no third-party account needed.",
  },
  {
    q: "Which payment methods are supported?",
    a: "VIV-Z uses Stripe for all payments. Stripe supports credit/debit cards, Apple Pay, Google Pay, and many local payment methods depending on your region.",
  },
  {
    q: "Can I use VIV-Z without a Stripe account?",
    a: "You can install and explore VIV-Z without Stripe, but clients will not be able to purchase packages or subscriptions until you connect a Stripe account in Settings.",
  },
  {
    q: "How do automated reminders work?",
    a: "VIV-Z runs a cron job that checks for sessions scheduled 24 hours in the future and sends reminder emails via Resend. No setup is required — reminders are active by default.",
  },
  {
    q: "What happens when I cancel a booking?",
    a: "Cancelling a booking returns the session to the client's package balance (if they paid via a package). You can configure whether refunds are issued through your Stripe dashboard.",
  },
  {
    q: "Can I run group sessions?",
    a: "Yes. When creating a booking, select the Group Session type and set a maximum number of participants. Clients can join the session from the portal until it is full.",
  },
  {
    q: "How do GHL workflow triggers work?",
    a: "After installing VIV-Z, you can configure GHL workflows to fire on VIV-Z events (booking created, session completed, etc.). VIV-Z sends a webhook to GHL when these events occur, which your GHL workflows can listen for.",
  },
];

export const metadata = {
  title: "Support — VIV-Z",
  description: "Get help with VIV-Z. Browse FAQs or contact our support team.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-violet-50 to-white px-6 py-16 text-center">
        <span className="mb-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          Support
        </span>
        <h1 className="mb-3 text-4xl font-black text-gray-900">
          How can we help?
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-gray-500">
          Browse the FAQ below or reach out directly. We aim to respond to all
          support requests within one business day.
        </p>
        <a
          href="mailto:support@viv-z.app"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-violet-800"
        >
          ✉ Email Support
        </a>
      </section>

      {/* Quick links */}
      <section className="border-b border-gray-100 px-6 py-10">
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: "📖",
              label: "Documentation",
              desc: "Full technical reference",
              href: "/docs",
            },
            {
              icon: "🚀",
              label: "Getting Started",
              desc: "Step-by-step setup guide",
              href: "/getting-started",
            },
            {
              icon: "✉",
              label: "Email Us",
              desc: "support@viv-z.app",
              href: "mailto:support@viv-z.app",
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="font-semibold text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-2xl font-black text-gray-900">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-gray-100 bg-gray-50 px-6 py-4 open:bg-violet-50 open:border-violet-200"
              >
                <summary className="cursor-pointer list-none font-semibold text-gray-900 group-open:text-violet-800">
                  {faq.q}
                  <span className="float-right text-gray-400 group-open:text-violet-500">▾</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Still need help */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-14 text-center">
        <h2 className="mb-2 text-2xl font-black">Still need help?</h2>
        <p className="mb-6 text-gray-500">
          Can&apos;t find the answer you&apos;re looking for? Our team is happy
          to assist.
        </p>
        <a
          href="mailto:support@viv-z.app"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-violet-800"
        >
          ✉ Contact Support
        </a>
      </section>

      <MarketingFooter />
    </div>
  );
}
