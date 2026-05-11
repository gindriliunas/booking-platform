import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Megaphone, Search, Share2 } from "lucide-react";
import { MarketingSiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Marketing & advertising — SEO, Google Ads, Meta, GBP — VIV-Z",
  description:
    "SEO, Google Ads, Facebook & Instagram (Meta) advertising, and Google Business Profile setup — strategy through optimisation and reporting.",
};

const INK = "#0a0a0b";
const PAPER = "#f5f5f7";
const ACCENT = "#ff5b04";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(245,245,247,0.45)";

const pillars = [
  {
    icon: Search,
    title: "SEO & organic visibility",
    intro:
      "Earn durable traffic with foundations that match how search engines and humans actually evaluate quality.",
    items: [
      "Technical audits — crawlability, indexation, Core Web Vitals, structured data",
      "Keyword strategy & information architecture aligned to intent",
      "On-page optimisation — titles, meta, headings, internal links",
      "Content briefs & refreshes for service pages, blogs, and FAQs",
      "Local SEO — citations, location pages, and consistent NAP signals",
      "Monthly reporting with actionable next steps (Search Console & analytics)",
    ],
  },
  {
    icon: Megaphone,
    title: "Google Ads",
    intro:
      "Paid search and feeds-based campaigns that tie spend to leads or revenue — not vanity clicks.",
    items: [
      "Search campaigns — branded, generic, and high-intent query clusters",
      "Performance Max where it fits your catalog or lead-gen model",
      "Display & YouTube remarketing for nurture and recall",
      "Conversion tracking, GA4 linking, and offline/import conversions where applicable",
      "Landing page QA — message match, speed, and form friction",
      "Bid strategies, budgets, and seasonal scaling with clear guardrails",
    ],
  },
  {
    icon: Share2,
    title: "Facebook & Instagram ads (Meta)",
    intro:
      "Creative-led acquisition and retargeting across Meta’s placements — built around your offers and audiences.",
    items: [
      "Prospecting vs remarketing structure — clear funnel stages",
      "Interest, lookalike, and engagement-based audiences (where policy allows)",
      "Creative testing — angles, hooks, formats (feed, stories, reels)",
      "Lead ads vs on-site conversion paths — picked for your CRM workflow",
      "Pixel / Conversions API hygiene for stable attribution",
      "Weekly optimisations — fatigue checks, frequency, placement trims",
    ],
  },
  {
    icon: MapPin,
    title: "Google Business Profile",
    intro:
      "Formerly Google My Business — your map pack presence for local discovery and trust signals.",
    items: [
      "Profile setup or reclaim — categories, services, attributes, hours",
      "Photo & cover guidelines, short-name, and booking/action links",
      "Review acquisition playbooks and response tone aligned to brand",
      "Google Posts & updates for offers, events, and seasonal pushes",
      "Products/services menus where relevant for your vertical",
      "Insights review — search terms, calls, direction requests, website taps",
    ],
  },
];

export default function MarketingAdvertisingPage() {
  return (
    <div className="min-h-screen" style={{ background: INK, color: PAPER }}>
      <MarketingSiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: "rgba(245,245,247,0.3)" }}>
          Demand generation · local · paid media
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
          Marketing &amp;{" "}
          <span style={{ color: ACCENT }}>advertising</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: MUTED }}>
          SEO, Google Ads, Meta (Facebook &amp; Instagram), and Google Business Profile — scoped engagements with clear
          objectives, tracking you can trust, and reporting you can act on. Perfect alongside a{" "}
          <Link href="/get-a-website" className="font-semibold underline-offset-4 hover:underline" style={{ color: PAPER }}>
            live VIV-Z website
          </Link>
          , but we also support existing sites.
        </p>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {pillars.map(({ icon: Icon, title, intro, items }) => (
            <article
              key={title}
              className="rounded-2xl p-8 lg:p-10"
              style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}
            >
              <div className="mb-6 flex size-12 items-center justify-center rounded-xl" style={{ background: `${ACCENT}14`, color: ACCENT }}>
                <Icon className="size-6" strokeWidth={1.75} aria-hidden />
              </div>
              <h2 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
                {intro}
              </p>
              <ul className="mt-6 space-y-2.5 text-sm leading-relaxed" style={{ color: MUTED }}>
                {items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span style={{ color: ACCENT, flexShrink: 0 }}>✓</span>
                    <span style={{ color: "rgba(245,245,247,0.72)" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section
          className="mt-20 rounded-3xl px-8 py-12 md:px-14 md:py-14"
          style={{
            border: `1px solid ${ACCENT}33`,
            background: `linear-gradient(135deg, rgba(255,91,4,0.12) 0%, rgba(10,10,11,0.92) 55%)`,
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: ACCENT }}>
            Engagements
          </p>
          <p className="mt-4 max-w-3xl text-xl font-bold md:text-2xl" style={{ letterSpacing: "-0.02em" }}>
            Audits, ongoing retainers, or hybrid — tell us your market, margin, and internal capacity; we&apos;ll propose a
            sensible scope.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110"
              style={{ background: ACCENT }}
            >
              Discuss campaigns &amp; SEO
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/services"
              className="rounded-full border px-8 py-3.5 text-sm font-bold transition-colors hover:bg-white/[0.06]"
              style={{ borderColor: BORDER, color: PAPER }}
            >
              Full capability list →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
