import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Gauge,
  Layers,
  Link2,
  Puzzle,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { VivZWordmark } from "@/components/marketing/logo";
import { MarketingSiteHeader } from "@/components/marketing/site-header";
import { opsAiPaymentModels, opsAiPricingTiers } from "@/content/ops-ai-pricing";

export const metadata: Metadata = {
  title: "Ops & AI — New software & features in existing systems — VIV-Z",
  description:
    "Build new internal software or ship features into what you already run — AI-accelerated delivery for dramatically faster results, integrations, and team enablement.",
};

const INK = "#0a0a0b";
const PAPER = "#f5f5f7";
const ACCENT = "#ff5b04";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(245,245,247,0.45)";

const valueBullets = [
  {
    title: "New software, without the multi-year rewrite",
    body: "Greenfield internal apps, services, and portals — scoped so you get working software in the calendar time your business can afford, not an endless programme.",
  },
  {
    title: "Features in the systems you already trust",
    body: "Extend CRMs, line-of-business tools, and SaaS with the workflows, screens, and integrations users keep asking for — shipped on top of live software, not parallel science projects.",
  },
  {
    title: "Up to 10× faster delivery with AI",
    body: "We use AI across spec, build, test, and integration work — always human-led — so the same scope lands in a fraction of the time versus a traditional-only engineering cycle.",
  },
  {
    title: "Outcomes you can measure",
    body: "Fewer manual steps, shorter cycle times, fewer defects — we tie milestones to what your operators and dashboards actually see after each release.",
  },
];

const services = [
  {
    icon: Layers,
    title: "New internal software",
    body: "From first internal product to the next major module — we design and build software around your real constraints: roles, approvals, audit, and how teams actually work. Low-code and modern stacks where they fit; custom where they don’t.",
  },
  {
    icon: Puzzle,
    title: "Features in existing software",
    body: "Ship net-new capability inside platforms you already pay for — new flows, APIs, admin surfaces, and automations on top of live systems so you extend instead of replace.",
  },
  {
    icon: Bot,
    title: "AI-accelerated engineering",
    body: "AI assists drafting, scaffolding, tests, and integration glue while engineers review, harden, and own quality. That is how we routinely compress delivery toward up to 10× faster results versus traditional-only cycles for comparable scope.",
  },
  {
    icon: Link2,
    title: "Integrations, data & enablement",
    body: "Wire CRMs, finance, warehouses, and spreadsheets into one coherent layer — then hand over patterns and coaching so your team can keep shipping without every change waiting on a vendor.",
  },
];

const impactStats = [
  {
    value: "Up to 10×",
    label: "illustrative calendar-time compression for comparable scope when AI-accelerated delivery is paired with tight scope — not a guarantee on every engagement",
  },
  {
    value: "80%",
    label: "illustrative share of repetitive work some teams aim to remove once the right workflows are automated — your baseline will differ",
  },
  {
    value: "2 weeks",
    label: "a realistic planning horizon for a very narrow first slice once access and sign-off are in place — not a promise for every stack",
  },
];

const pillars = [
  {
    title: "Greenfield or brownfield — same discipline",
    body: "Whether we are standing up new software or extending a live system, we sequence risk: thin vertical slices, feature flags where needed, and rollback paths so production stays trustworthy.",
  },
  {
    title: "AI speeds the craft, people own the outcome",
    body: "Accelerated coding and checks are only useful with senior review, security thinking, and acceptance criteria you can sign — we never treat generated output as production-ready by default.",
  },
  {
    title: "Product, ops, and engineering in one loop",
    body: "We translate “what the business needs” into backlog-sized features, APIs, and UIs — so roadmaps shrink from quarters of analysis to weeks of shipped increments.",
  },
  {
    title: "Keep shipping after launch",
    body: "Documentation, patterns, and enablement mean your next feature is not another vendor dependency — your team can iterate while we stay available for heavier lifts.",
  },
];

/** Forward-looking examples — not client testimonials */
const outcomeExamples = [
  {
    title: "Fewer hours on swivel-chair work",
    body: "Imagine ten people losing thirty minutes a day to re-keying between systems — that is roughly one hundred staff-hours a month you could redirect if those steps were automated or built into the software they already use.",
  },
  {
    title: "Less time waiting on manual handoffs",
    body: "Approvals, status checks, and “who has the latest spreadsheet?” quietly add up. Even modest process automation or a small feature in an existing app can return whole days per week to core work.",
  },
  {
    title: "A clearer picture for leadership",
    body: "When data flows through one place instead of inboxes and side files, reporting stops being a reconstruction project — the value is fewer errors and faster decisions, not vanity dashboards.",
  },
];

export default function InternalSystemsPage() {
  return (
    <div className="min-h-screen" style={{ background: INK, color: PAPER }}>
      <MarketingSiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background: `radial-gradient(ellipse 80% 55% at 50% -10%, ${ACCENT}22 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 40%, rgba(124,58,237,0.08) 0%, transparent 50%)`,
            }}
          />
          <div className="relative mx-auto max-w-6xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: "rgba(245,245,247,0.35)" }}>
              New software · features in prod · AI-accelerated delivery
            </p>
            <h1
              className="max-w-4xl"
              style={{
                fontSize: "clamp(2.35rem, 6vw, 4rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}
            >
              Build new software or ship features in what you already run —{" "}
              <span style={{ color: ACCENT }}>up to 10× faster</span>
              <span className="text-[rgba(245,245,247,0.92)]"> using AI</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed md:text-xl" style={{ color: MUTED }}>
              We partner with product and operations leaders on greenfield internal products and on net-new capability inside live systems — with AI compressing spec-to-ship time while humans stay accountable for quality and risk.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: ACCENT }}
              >
                Schedule a call
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="#services"
                className="rounded-full border px-8 py-3.5 text-sm font-bold transition-colors hover:bg-white/[0.06]"
                style={{ borderColor: BORDER, color: PAPER }}
              >
                Explore our services
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-semibold underline-offset-4 transition-colors hover:text-[#f5f5f7]"
                style={{ color: MUTED }}
              >
                Pricing →
              </Link>
              <Link
                href="/business-management-saas"
                className="text-sm font-semibold underline-offset-4 transition-colors hover:text-[#f5f5f7]"
                style={{ color: MUTED }}
              >
                CRM →
              </Link>
            </div>
          </div>
        </section>

        {/* Frictions + value */}
        <section className="border-t px-6 py-20 md:py-28" style={{ borderColor: BORDER }}>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
                  Why delivery feels stuck
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl" style={{ letterSpacing: "-0.03em" }}>
                  New builds wait. Feature backlogs grow. AI fixes the pace — not the intent.
                </h2>
                <p className="mt-6 leading-relaxed" style={{ color: MUTED }}>
                  The bottleneck is rarely “we don’t know what to build” — it is capacity to turn intent into merged, tested software on new stacks and on the platforms you already run.
                  We focus on shippable slices: new internal products where it makes sense, and concrete features in existing software everywhere else — accelerated with AI so results land in weeks, not quarters.
                </p>
                <p className="mt-4 font-semibold leading-relaxed" style={{ color: "rgba(245,245,247,0.68)" }}>
                  How we help you move:
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {valueBullets.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl p-6"
                    style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                      <Zap className="size-5" aria-hidden />
                    </div>
                    <h3 className="font-bold tracking-tight">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Staff-time illustration — hypothetical, not a client story */}
        <section className="px-6 py-16 md:py-24" style={{ background: "rgba(255,91,4,0.04)" }}>
          <div className="mx-auto max-w-6xl">
            <div
              className="rounded-3xl p-8 md:p-12 lg:p-14"
              style={{ border: `1px solid ${ACCENT}33`, background: `linear-gradient(145deg, rgba(255,91,4,0.1) 0%, rgba(10,10,11,0.95) 45%)` }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <Sparkles className="size-5" style={{ color: ACCENT }} aria-hidden />
                <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: ACCENT }}>
                  Hypothetical — not a case study
                </p>
              </div>
              <h2 className="mt-5 max-w-3xl text-2xl font-extrabold tracking-tight md:text-3xl" style={{ letterSpacing: "-0.03em" }}>
                Imagine how many staff hours automation could win back
              </h2>
              <p className="mt-6 max-w-3xl leading-relaxed" style={{ color: "rgba(245,245,247,0.72)" }}>
                Picture a team where a handful of repeatable steps — copying rows between tools, chasing approvals by email, reconciling two exports — adds up to even{" "}
                <strong style={{ color: PAPER }}>twenty minutes per person per day</strong>. Across twenty people, that is on the order of{" "}
                <strong style={{ color: PAPER }}>one hundred and sixty hours a month</strong> tied up in steps that better tooling or targeted features could absorb instead.
                None of that requires a big-bang rewrite: often it is a focused feature, a bridge between systems, or a workflow your people already wish existed.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed" style={{ color: MUTED }}>
                We are not claiming these figures for your organisation — they are a simple thought experiment to size the opportunity before you commit to build. On a call we can sanity-check numbers against how you actually work today.
              </p>
              <div className="mt-10">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110"
                  style={{ background: ACCENT }}
                >
                  Talk through your workflows
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="border-t px-6 py-20 md:py-28" style={{ borderColor: BORDER }}>
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
              Services at a glance
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl" style={{ letterSpacing: "-0.035em" }}>
              From net-new software to the next feature in prod
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed" style={{ color: MUTED }}>
              Secure, reviewable delivery — whether you need a new internal product or meaningful changes inside Microsoft 365, Google Workspace, CRMs, warehouses, or a stack that grew organically over years.
            </p>

            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {services.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="rounded-2xl p-8 transition-colors hover:bg-white/[0.03]"
                  style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="mb-5 flex size-12 items-center justify-center rounded-xl" style={{ background: `${ACCENT}14`, color: ACCENT }}>
                    <Icon className="size-6" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                  <p className="mt-3 leading-relaxed" style={{ color: MUTED }}>
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t px-6 py-20 md:py-24" style={{ borderColor: BORDER, background: "#070708" }}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
                  Our impact
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl" style={{ letterSpacing: "-0.035em" }}>
                  Velocity, quality, and impact — when AI accelerates delivery
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed" style={{ color: "rgba(245,245,247,0.35)" }}>
                Illustrative planning figures — not reported client outcomes for this service. Your calendar and savings depend on scope, stack, and adoption. We baseline with you before we build.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {impactStats.map((s) => (
                <div key={s.value} className="rounded-2xl p-8" style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-4xl font-black tracking-tighter md:text-5xl" style={{ color: ACCENT }}>
                    {s.value}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: MUTED }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-24 border-t px-6 py-20 md:py-28" style={{ borderColor: BORDER }}>
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
              Pricing
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl" style={{ letterSpacing: "-0.035em" }}>
              Typical engagement brackets
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed" style={{ color: MUTED }}>
              Orientation bands for new software and feature work — including AI-accelerated delivery — final quotes depend on stack, governance, and how much we parallelise. Low-code and AI platform licences are usually billed separately; we surface those during discovery.
            </p>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {opsAiPricingTiers.map((t) => (
                <article
                  key={t.name}
                  className="flex flex-col rounded-2xl p-8"
                  style={{
                    border: t.highlight ? `2px solid ${ACCENT}88` : `1px solid ${BORDER}`,
                    background: t.highlight ? `linear-gradient(165deg, ${ACCENT}14 0%, rgba(10,10,11,0.96) 45%)` : "rgba(255,255,255,0.02)",
                    boxShadow: t.highlight ? `0 0 0 1px ${ACCENT}22` : undefined,
                  }}
                >
                  {t.highlight ? (
                    <span className="mb-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${ACCENT}22`, color: ACCENT }}>
                      Often picked next
                    </span>
                  ) : null}
                  <h3 className="text-xl font-black tracking-tight">{t.name}</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: ACCENT }}>
                    {t.tagline}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: MUTED }}>
                    {t.summary}
                  </p>
                  <div className="mt-6 border-t pt-6" style={{ borderColor: BORDER }}>
                    <p className="text-3xl font-black tracking-tighter" style={{ color: PAPER }}>
                      {t.price}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "rgba(245,245,247,0.35)" }}>
                      {t.priceNote}
                    </p>
                    <p className="mt-4 text-sm leading-snug" style={{ color: MUTED }}>
                      {t.duration}
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-center text-sm font-bold text-white transition-all hover:brightness-110"
                    style={{ background: ACCENT }}
                  >
                    {t.cta}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {t.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed">
                        <Check className="size-5 shrink-0" strokeWidth={2.25} style={{ color: ACCENT }} aria-hidden />
                        <span style={{ color: "rgba(245,245,247,0.78)" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 border-t pt-6 text-sm leading-relaxed" style={{ borderColor: BORDER, color: "rgba(245,245,247,0.42)" }}>
                    {t.footnote}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-14 rounded-2xl p-8 md:p-10" style={{ border: `1px solid ${BORDER}`, background: "#070708" }}>
              <h3 className="text-lg font-bold tracking-tight">Ways to structure payment</h3>
              <ul className="mt-6 space-y-6">
                {opsAiPaymentModels.map((pm) => (
                  <li key={pm.title} className="flex flex-col gap-1 md:flex-row md:gap-10">
                    <span className="shrink-0 font-semibold md:min-w-52" style={{ color: PAPER }}>
                      {pm.title}
                    </span>
                    <span className="text-sm leading-relaxed" style={{ color: MUTED }}>
                      {pm.body}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-center text-sm" style={{ color: "rgba(245,245,247,0.38)" }}>
                Questions on scope or commercials?{" "}
                <Link href="/contact" className="font-semibold underline-offset-2 hover:underline" style={{ color: ACCENT }}>
                  Get in touch
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Why VIV-Z */}
        <section className="border-t px-6 py-20 md:py-28" style={{ borderColor: BORDER }}>
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
              Why VIV-Z?
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl" style={{ letterSpacing: "-0.035em" }}>
              More reasons product &amp; ops leaders work with us
            </h2>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {pillars.map((p, i) => (
                <div key={p.title} className="relative rounded-2xl p-8" style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}>
                  <span className="absolute right-6 top-6 text-5xl font-black tabular-nums" style={{ color: `${ACCENT}14` }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl" style={{ background: `${ACCENT}12`, color: ACCENT }}>
                    <Gauge className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Outcome examples — illustrative, not testimonials */}
        <section className="border-t px-6 py-20 md:py-28" style={{ borderColor: BORDER }}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-wrap items-center gap-4">
              <Users className="size-6" style={{ color: ACCENT }} aria-hidden />
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl" style={{ letterSpacing: "-0.035em" }}>
                Outcomes teams often aim for
              </h2>
            </div>
            <p className="mb-10 max-w-2xl text-sm leading-relaxed" style={{ color: MUTED }}>
              We do not have public case studies for this line of work yet — below are the kinds of results organisations typically hope automation and better software will unlock. Your mileage will depend on process, data, and adoption.
            </p>
            <div className="grid gap-6 lg:grid-cols-3">
              {outcomeExamples.map((ex) => (
                <div
                  key={ex.title}
                  className="flex flex-col rounded-2xl p-8"
                  style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)" }}
                >
                  <h3 className="text-lg font-bold tracking-tight" style={{ color: PAPER }}>
                    {ex.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: MUTED }}>
                    {ex.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t px-6 py-24 md:py-32" style={{ borderColor: BORDER }}>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-[2.75rem]" style={{ letterSpacing: "-0.035em", lineHeight: 1.08 }}>
              Ready for the{" "}
              <span style={{ color: ACCENT }}>next release</span>?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl leading-relaxed" style={{ color: MUTED }}>
              Whether you are kicking off new internal software or clearing a backlog of features in systems you already rely on, we combine AI-accelerated delivery with senior ownership — so your team sees working software, not another strategy deck.
            </p>
            <div className="mx-auto mt-10 max-w-lg text-left">
              <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: ACCENT }}>
                Two easy next steps
              </p>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed" style={{ color: MUTED }}>
                <li className="flex gap-3">
                  <span className="font-bold tabular-nums" style={{ color: PAPER }}>1.</span>
                  <span>
                    <strong style={{ color: PAPER }}>Shape the slice</strong> — new product vs next features in prod, success criteria, and risk boundaries.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold tabular-nums" style={{ color: PAPER }}>2.</span>
                  <span>
                    <strong style={{ color: PAPER }}>Ship with AI leverage</strong> — we run an AI-accelerated build cycle you can inspect, then iterate with your team.
                  </span>
                </li>
              </ol>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: ACCENT }}
              >
                Schedule a call
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/business-management-saas"
                className="rounded-full border px-10 py-4 text-sm font-bold transition-colors hover:bg-white/[0.06]"
                style={{ borderColor: BORDER, color: PAPER }}
              >
                Explore CRM
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-12" style={{ borderColor: BORDER, background: "#060607" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <VivZWordmark size="sm" />
          <p className="text-sm" style={{ color: "rgba(245,245,247,0.35)" }}>
            © {new Date().getFullYear()} VIV-Z · Software delivery &amp; AI-accelerated engineering
          </p>
          <div className="flex flex-wrap gap-6 text-sm" style={{ color: "rgba(245,245,247,0.45)" }}>
            <Link href="/contact" className="transition-colors hover:text-[#f5f5f7]">
              Contact
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[#f5f5f7]">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[#f5f5f7]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
