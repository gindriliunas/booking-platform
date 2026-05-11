import type { Metadata } from "next";
import Link from "next/link";
import { MarketingSiteHeader } from "@/components/marketing/site-header";
import { ghlBusinessSaasAreas } from "@/content/ghl-business-saas-areas";

export const metadata: Metadata = {
  title: "Business Management SaaS — VIV-Z",
  description:
    "VIV-Z business management SaaS — CRM, automation, scheduling, funnels, and customer journeys configured for your brand and operating model.",
};

const INK = "#0a0a0b";
const PAPER = "#f5f5f7";
const ACCENT = "#ff5b04";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(245,245,247,0.45)";

function ModuleSection({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section
      className="rounded-2xl p-8"
      style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}
    >
      <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
        {title}
      </h2>
      <ul className="space-y-2.5 text-sm leading-relaxed" style={{ color: MUTED }}>
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span style={{ color: ACCENT, flexShrink: 0 }}>✓</span>
            <span style={{ color: "rgba(245,245,247,0.72)" }}>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function BusinessManagementSaasPage() {
  return (
    <div className="min-h-screen" style={{ background: INK, color: PAPER }}>
      <MarketingSiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: "rgba(245,245,247,0.3)" }}>
          VIV-Z · CRM · automation
        </p>
        <h1
          className="max-w-4xl"
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          Business Management{" "}
          <span style={{ color: ACCENT }}>SaaS</span>
        </h1>
        <p className="mt-4 max-w-3xl text-lg font-semibold tracking-tight" style={{ color: "rgba(245,245,247,0.72)" }}>
          The VIV-Z stack — shaped around your brand and how you operate
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: MUTED }}>
          We deploy and configure the unified suite your teams actually work in: CRM, pipelines, campaigns,
          conversations, scheduling, funnels, and reporting — delivered so your clients experience{" "}
          <span style={{ color: "rgba(245,245,247,0.82)", fontWeight: 700 }}>your</span>{" "}
          brand front and centre. Menus and labels vary by release — the playbook below is how we typically design,
          build, and train.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ghlBusinessSaasAreas.map((block) => (
            <ModuleSection key={block.title} title={block.title} items={block.items} />
          ))}
        </div>

        <aside
          className="mt-16 rounded-2xl p-8 md:p-10"
          style={{ border: `1px solid ${ACCENT}33`, background: `linear-gradient(135deg, rgba(255,91,4,0.08) 0%, rgba(10,10,11,0.92) 45%)` }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: ACCENT }}>
            Websites &amp; bookings
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed" style={{ color: "rgba(245,245,247,0.72)" }}>
            Need a client-facing site first? We still build your marketing website for free — and{" "}
            <strong style={{ color: PAPER }}>website hosting includes our client booking portal at no extra charge</strong>
            , so sessions and packages stay tied to the same stack.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/get-a-website"
              className="rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110"
              style={{ background: ACCENT }}
            >
              Claim your free website →
            </Link>
            <Link
              href="/contact"
              className="rounded-full border px-8 py-3.5 text-sm font-bold transition-colors hover:bg-white/[0.06]"
              style={{ borderColor: BORDER, color: PAPER }}
            >
              Discuss SaaS rollout →
            </Link>
          </div>
        </aside>

        <section
          className="mt-16 rounded-3xl px-8 py-12 text-center md:px-14"
          style={{
            border: `1px solid ${ACCENT}33`,
            background: `linear-gradient(135deg, rgba(255,91,4,0.12) 0%, rgba(10,10,11,0.9) 55%)`,
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: ACCENT }}>
            Custom automation &amp; internal tools
          </p>
          <p className="mt-4 text-xl font-bold md:text-2xl" style={{ color: PAPER }}>
            Beyond the core suite — low-code apps, AI workflows, and integrations
          </p>
          <Link
            href="/internal-systems"
            className="mt-8 inline-flex rounded-full border px-8 py-3.5 text-sm font-bold transition-colors hover:bg-white/[0.06]"
            style={{ borderColor: BORDER, color: PAPER }}
          >
            Explore Ops &amp; AI →
          </Link>
        </section>
      </main>
    </div>
  );
}
