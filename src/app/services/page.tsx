import type { Metadata } from "next";
import Link from "next/link";
import { MarketingSiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "More Services — VIV-Z",
  description:
    "Web apps, mobile apps, SEO, paid ads, CRM & automation suites, DevOps, cloud engineering, security, AI implementations, and more.",
};

const INK = "#0a0a0b";
const PAPER = "#f5f5f7";
const ACCENT = "#ff5b04";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(245,245,247,0.45)";

const coreOfferings = [
  {
    title: "Apps & platforms",
    items: [
      "Custom web applications",
      "Native & cross-platform mobile apps",
      "Product design, prototyping & UX",
      "API design & third-party integrations",
    ],
  },
  {
    title: "Growth & visibility",
    items: [
      "SEO strategy, audits & ongoing optimisation",
      "Google Ads — search, display & Performance Max",
      "Facebook & Instagram Ads (Meta)",
      "Google Business Profile setup & optimisation",
    ],
  },
  {
    title: "CRM, automation & AI",
    items: [
      "CRM selection, migration & configuration",
      "Workflow automation across your stack",
      "AI receptionist & conversational assistants",
      "AI implementation for operations, sales & support",
    ],
  },
  {
    title: "Infrastructure & security",
    items: [
      "DevOps pipelines & release automation",
      "Cloud architecture & engineering (AWS, GCP, Azure)",
      "Application security reviews & hardening",
      "Monitoring, backups & incident readiness",
    ],
  },
];

function ServiceSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section
      className="rounded-2xl p-8"
      style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}
    >
      <h2
        className="mb-5 text-xs font-bold uppercase tracking-[0.3em]"
        style={{ color: ACCENT }}
      >
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

export default function ServicesPage() {
  return (
    <div className="min-h-screen" style={{ background: INK, color: PAPER }}>
      <MarketingSiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <aside
          className="mb-12 rounded-2xl p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8"
          style={{ border: `1px solid ${ACCENT}33`, background: `linear-gradient(135deg, rgba(255,91,4,0.1) 0%, rgba(10,10,11,0.92) 50%)` }}
        >
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: ACCENT }}>
              Internal tools &amp; automation
            </p>
            <p className="mt-3 text-lg font-bold tracking-tight" style={{ color: PAPER }}>
              Low-code apps, AI workflows, integrations &amp; team enablement
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>
              Same muscle as boutique ops consultancies — scoped pilots, connected stacks, measurable throughput.
            </p>
          </div>
          <Link
            href="/internal-systems"
            className="mt-6 inline-flex shrink-0 rounded-full px-7 py-3 text-sm font-bold text-white transition-all hover:brightness-110 md:mt-0"
            style={{ background: ACCENT }}
          >
            View Ops &amp; AI offering →
          </Link>
        </aside>

        <aside
          className="mb-12 rounded-2xl p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8"
          style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}
        >
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: ACCENT }}>
              Marketing &amp; advertising
            </p>
            <p className="mt-3 text-lg font-bold tracking-tight" style={{ color: PAPER }}>
              SEO, Google Ads, Meta, Google Business Profile
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>
              Organic and paid channels with clear tracking — complements your website and SaaS stack.
            </p>
          </div>
          <Link
            href="/marketing-advertising"
            className="mt-6 inline-flex shrink-0 rounded-full px-7 py-3 text-sm font-bold text-white transition-all hover:brightness-110 md:mt-0"
            style={{ background: ACCENT }}
          >
            Explore marketing services →
          </Link>
        </aside>

        <p
          className="mb-4 text-xs font-semibold uppercase tracking-[0.4em]"
          style={{ color: "rgba(245,245,247,0.3)" }}
        >
          Beyond brochure websites
        </p>
        <h1
          className="max-w-3xl"
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          Other{" "}
          <span style={{ color: ACCENT }}>services</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: MUTED }}>
          We build serious digital products and growth systems — not only marketing sites. Tell us what
          you&apos;re aiming for on{" "}
          <Link href="/contact" className="font-semibold underline-offset-4 hover:underline" style={{ color: PAPER }}>
            the contact page
          </Link>{" "}
          and we&apos;ll scope it with you.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {coreOfferings.map((block) => (
            <ServiceSection key={block.title} title={block.title} items={block.items} />
          ))}
        </div>

        <aside
          className="mt-20 rounded-3xl p-8 md:flex md:items-center md:justify-between md:gap-10 md:p-10"
          style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.03)" }}
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: ACCENT }}>
              CRM
            </p>
            <h2
              className="mt-3 max-w-xl text-2xl font-extrabold tracking-tight md:text-3xl"
              style={{ letterSpacing: "-0.03em", color: PAPER }}
            >
              VIV-Z CRM platform — sales through to bookings under your brand
            </h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: MUTED }}>
              Full module map, rollout approach, and how hosting bundles in our client booking portal live on its own
              page — so this stays a catalogue of everything else we ship.
            </p>
          </div>
          <Link
            href="/business-management-saas"
            className="mt-8 inline-flex shrink-0 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 md:mt-0"
            style={{ background: ACCENT }}
          >
            Explore CRM platform →
          </Link>
        </aside>

        <section
          className="mt-20 rounded-3xl px-8 py-12 text-center md:px-14"
          style={{
            border: `1px solid ${ACCENT}33`,
            background: `linear-gradient(135deg, rgba(255,91,4,0.12) 0%, rgba(10,10,11,0.9) 55%)`,
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: ACCENT }}>
            Next step
          </p>
          <p className="mt-4 text-xl font-bold md:text-2xl" style={{ color: PAPER }}>
            Share your goals — we&apos;ll recommend the shortest path to ship.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110"
              style={{ background: ACCENT }}
            >
              Contact VIV-Z →
            </Link>
            <Link
              href="/get-a-website"
              className="rounded-full border px-8 py-3.5 text-sm font-bold transition-colors hover:bg-white/[0.06]"
              style={{ borderColor: BORDER, color: PAPER }}
            >
              Free website build
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
