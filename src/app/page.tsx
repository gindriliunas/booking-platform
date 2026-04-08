import Link from "next/link";
import { VivZLogo } from "@/components/marketing/logo";
import { RevenueCalculator } from "@/components/marketing/revenue-calculator";

const features = [
  {
    icon: "🌐",
    title: "Professional Website",
    description:
      "Custom-designed, mobile-first website built to convert visitors into paying clients. Looks premium from day one.",
  },
  {
    icon: "📅",
    title: "Online Booking",
    description:
      "Clients book and pay for sessions 24/7 — no back-and-forth texts. Packages, subscriptions, and group classes all supported.",
  },
  {
    icon: "📍",
    title: "Google My Business Setup",
    description:
      "We set up and optimise your Google Business Profile so you appear in local search results and on Google Maps. More visibility, more calls, more clients.",
  },
  {
    icon: "👥",
    title: "CRM & Client Management",
    description:
      "Every lead, enquiry, and client tracked automatically. See their history, notes, and session records in one place.",
  },
  {
    icon: "📱",
    title: "Social Media Scheduler",
    description:
      "Plan and publish posts to Instagram, Facebook, Google and more from a single dashboard. Stay consistent without the effort.",
  },
  {
    icon: "✉️",
    title: "Business Email Address",
    description:
      "yourname@yourdomain.com included. Look professional and keep work separate from your personal inbox.",
  },
  {
    icon: "⭐",
    title: "Reviews & Reputation",
    description:
      "Automatically request Google reviews after sessions. Display them on your site to build trust and win new clients.",
  },
  {
    icon: "📞",
    title: "Missed Call Text-Back",
    description:
      "If you miss a call while you're with a client, an automatic text fires back instantly. You never lose a lead because you were busy.",
  },
  {
    icon: "💬",
    title: "Unified Inbox",
    description:
      "SMS, email, web chat, Facebook DMs, and Instagram messages — all in one inbox. Respond to everyone from one place.",
  },
  {
    icon: "📧",
    title: "Email Marketing & Newsletters",
    description:
      "Send branded email campaigns to your client list. Promote offers, share tips, and stay top of mind — all with ready-made templates.",
  },
  {
    icon: "🎯",
    title: "Lead Pipeline",
    description:
      "Visualise every prospect from first enquiry to paying client. Know exactly where each lead is and what action to take next.",
  },
  {
    icon: "📋",
    title: "Smart Forms",
    description:
      "Intake forms, consultation requests, PAR-Q, and lead capture all built in. Responses feed straight into your CRM.",
  },
  {
    icon: "⚡",
    title: "Automations",
    description:
      "Appointment reminders, follow-up sequences, no-show handling, and welcome messages — running on autopilot.",
  },
  {
    icon: "🌍",
    title: "Domain Name",
    description:
      "Your own .co.uk or .com domain included. No separate registrar accounts to manage.",
  },
  {
    icon: "🖥️",
    title: "Hosting",
    description:
      "Fast, reliable hosting with SSL included. Your site is always live, always secure — we handle the tech.",
  },
];

const painPoints = [
  {
    problem: "Paying for 5+ separate tools",
    detail:
      "Wix, Calendly, Mailchimp, a separate CRM, and a social scheduler — adding up to £150–£200+ a month and none of them talk to each other.",
  },
  {
    problem: "Website that doesn't get you clients",
    detail:
      "A basic template site with no SEO, no booking, and no clear call to action. Visitors land and bounce straight to a competitor.",
  },
  {
    problem: "Hours lost to admin every week",
    detail:
      "Manually chasing enquiries, sending reminders, posting on social media, and handling bookings by DM. Time you should be spending with clients.",
  },
  {
    problem: "No follow-up system",
    detail:
      "Leads come in, you get busy, they go cold. Without an automated system you're leaving money on the table every single day.",
  },
];

const personas = [
  { icon: "🏋️", title: "Personal Trainers", desc: "1-to-1, small group, and online coaching" },
  { icon: "💆", title: "Massage Therapists", desc: "Sports massage, deep tissue, relaxation" },
  { icon: "🦴", title: "Physiotherapists", desc: "Injury rehab and movement specialists" },
  { icon: "🥗", title: "Nutritionists & Dietitians", desc: "Dietary coaching and health plans" },
  { icon: "🧘", title: "Yoga & Pilates Instructors", desc: "Studio, online, and retreat-based" },
  { icon: "🧠", title: "Life & Wellness Coaches", desc: "Mindset, stress, and performance" },
];

const faqs = [
  {
    q: "Do I need any technical skills?",
    a: "None at all. We build and set everything up for you. You log in to a simple dashboard to manage your bookings and clients. That's it.",
  },
  {
    q: "I already have a website — do I need to replace it?",
    a: "If your current site isn't bringing in clients, ranking on Google, or letting people book and pay online, then yes — it's costing you money. We replace it with something that actually works. If you love your existing site, we can still connect the CRM, booking, and marketing tools to it.",
  },
  {
    q: "Will this actually help me get more clients?",
    a: "A professional website that ranks on Google, an optimised Google Business Profile, automated review requests, and a system that follows up every enquiry — yes, it's designed to bring clients in. Most service providers lose leads simply because they don't follow up fast enough. This system does it automatically.",
  },
  {
    q: "Do you manage everything, or will I have to learn a complicated system?",
    a: "We handle the full setup. Day-to-day you just manage your bookings and reply to messages — both are straightforward. You don't need to touch the technical side at all unless you want to.",
  },
  {
    q: "What if I don't have a logo or professional photos yet?",
    a: "Don't let that hold you back. We can work with what you have and advise on simple, affordable ways to get photos taken. A clean, well-structured site with decent photos will outperform a fancy site with nothing on it every time.",
  },
  {
    q: "How long does setup take?",
    a: "Your website and full platform are typically live within 3–5 working days of us receiving your content and branding details.",
  },
  {
    q: "Is the booking software included?",
    a: "Yes — a fully branded client booking portal is included. Your clients can book sessions, buy packages, and manage their appointments without any third-party app.",
  },
  {
    q: "Can I keep my existing domain?",
    a: "Absolutely. We can connect your existing domain or provide a new one as part of your subscription.",
  },
  {
    q: "Is there a long-term contract?",
    a: "No. Cancel anytime with 30 days' notice. Your domain and all your data can be exported on request — you're never locked in.",
  },
  {
    q: "£79 a month seems expensive — is it worth it?",
    a: "Consider what you're replacing: a web designer, an SEO expert, a CRM, a booking tool, a social scheduler, business email, SMS, review management, and hosting. That stack costs £500–£1,000+ per month when bought separately — or thousands upfront just for the website alone. At £79/month all-in, it pays for itself the moment it brings you one extra client.",
  },
  {
    q: "Is there a guarantee?",
    a: "Yes. If your website isn't live within the agreed timeframe, or you're not completely satisfied in your first 30 days, we'll give you a full refund. No questions asked. We're confident in what we deliver — and we want you to feel zero risk signing up.",
  },
  {
    q: "How is this different from other all-in-one tools?",
    a: "Most all-in-one platforms require you to build everything yourself — the website, the automations, all of it. VIV-Z is done-for-you. We design, build, and configure everything specifically for your health & fitness business. You're live in days, not months, and you never have to touch the technical side.",
  },
  {
    q: "I already have clients — why would I need this?",
    a: "If your calendar isn't consistently full, or you're spending hours each week on admin, or you're losing leads because you didn't follow up fast enough — this system fixes all of that. Most clients don't just get more bookings, they get back 5–10 hours a week they were wasting on manual tasks.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAV */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" aria-label="VIV-Z Home">
            <VivZLogo size="sm" className="[&_span]:text-white" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-300 md:flex">
            <Link href="#features" className="transition hover:text-emerald-400">Features</Link>
            <Link href="#who" className="transition hover:text-emerald-400">Who it&apos;s for</Link>
            <Link href="#pricing" className="transition hover:text-emerald-400">Pricing</Link>
            <Link href="#calculator" className="transition hover:text-emerald-400">Calculator</Link>
            <Link href="#faq" className="transition hover:text-emerald-400">FAQ</Link>
            <Link href="/sign-in" className="transition hover:text-emerald-400">Business Login</Link>
          </nav>
          <Link
            href="#pricing"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-emerald-400"
          >
            Get Started — £79/mo
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gray-950 px-6 pb-24 pt-20 text-white md:pb-36 md:pt-28">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-emerald-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-teal-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Built for health &amp; fitness professionals
            </span>
          </div>

          <h1 className="mb-6 text-center text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
            More clients. Less admin.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              A business that runs itself.
            </span>
          </h1>

          <p className="mx-auto mb-4 max-w-3xl text-center text-lg text-gray-300 md:text-xl">
            Personal trainers, coaches, and therapists use VIV-Z to fill their calendar, stop losing leads, and free up hours every week —{" "}
            <strong className="text-white">without stitching together 10 different tools.</strong>
          </p>

          <p className="mb-10 text-center text-2xl font-black text-emerald-400">
            £79 / month. Everything included. No setup fees.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="#pricing"
              className="rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-emerald-400"
            >
              Get my website built in 3–5 days →
            </Link>
            <Link
              href="#features"
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              See everything included
            </Link>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">30-day money-back guarantee · No setup fee · Cancel anytime</p>

          {/* Trust bar */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            {["No long contracts", "Live within 3–5 days", "UK-based support", "30-day money-back guarantee"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF — CLIENT PORTFOLIO */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700">
              Real businesses. Real results.
            </span>
            <h2 className="mb-3 text-3xl font-black md:text-4xl">
              See it in action — built in days, not months
            </h2>
            <p className="text-lg text-gray-500">
              These are real health &amp; fitness businesses running on VIV-Z right now.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Client 1 */}
            <div className="group rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl">🏋️</div>
                <div>
                  <h3 className="font-bold text-gray-900">Felipe Rodas</h3>
                  <p className="text-xs text-gray-500">Personal Trainer · Stockwell, London</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-gray-500">Professional site with online booking, client portal, and automated follow-ups — live within days.</p>
              <a
                href="https://www.feliperodas.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-500"
              >
                View site →
              </a>
            </div>

            {/* Client 2 */}
            <div className="group rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-xl">💪</div>
                <div>
                  <h3 className="font-bold text-gray-900">GI Training</h3>
                  <p className="text-xs text-gray-500">Personal Training · Launching this week</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-gray-500">Full platform setup including website, CRM, booking system, and automations — built and ready to go live.</p>
              <a
                href="https://www.gitraining.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-500"
              >
                View site →
              </a>
            </div>

            {/* Client 3 */}
            <div className="group rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-xl">🩺</div>
                <div>
                  <h3 className="font-bold text-gray-900">Skills 4 2 U</h3>
                  <p className="text-xs text-gray-500">First Aid Training · UK-wide</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-gray-500">Training provider with online booking, course management, and automated client communications.</p>
              <a
                href="https://www.skills42u.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-500"
              >
                View site →
              </a>
            </div>

            {/* Your business here */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl">✨</div>
              <h3 className="mb-1 font-bold text-emerald-800">Your business here</h3>
              <p className="mb-4 text-sm text-emerald-600">We're onboarding new clients now — limited spots available each month.</p>
              <a
                href="#pricing"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-400"
              >
                Get started →
              </a>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-gray-100 bg-gray-50 px-8 py-5 text-sm font-medium text-gray-600">
            {[
              "Live in 3–5 working days",
              "Mobile-first, built to rank on Google",
              "Bookings & payments from day one",
            ].map((s) => (
              <span key={s} className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-black md:text-4xl">Sound familiar?</h2>
            <p className="text-lg text-gray-500">
              These are the problems most fitness and therapy professionals are dealing with right now.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {painPoints.map((p) => (
              <div
                key={p.problem}
                className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-red-400">✗</span>
                  <h3 className="font-bold text-gray-900">{p.problem}</h3>
                </div>
                <p className="text-sm text-gray-500">{p.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-8 text-center">
            <p className="text-lg font-bold text-emerald-900">
              VIV-Z replaces all of it — one platform, one login, one monthly price.
            </p>
          </div>
        </div>
      </section>

      {/* BUILT BY FITNESS PROS */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-10 md:p-14">
            <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-3xl shadow-md">
                🏋️
              </div>
              <div>
                <span className="mb-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                  Built by fitness professionals
                </span>
                <h2 className="mb-3 text-2xl font-black text-gray-900 md:text-3xl">
                  We know the industry because we&apos;ve worked in it.
                </h2>
                <p className="leading-relaxed text-gray-600">
                  VIV-Z was built by health and fitness professionals who got
                  tired of stitching together tools that weren&apos;t designed
                  for this industry. We&apos;ve experienced the admin overload,
                  the no-shows, the leads that go cold — and we built the
                  platform we always wished existed. Everything in VIV-Z is
                  designed specifically around how fitness and wellness
                  businesses actually run.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVENUE CALCULATOR */}
      <RevenueCalculator />

      {/* FEATURES */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700">
              Everything included
            </span>
            <h2 className="mb-3 text-3xl font-black md:text-4xl">
              One platform. 15+ tools. Zero headaches.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-500">
              Everything you need to attract clients, look professional, and run your business — under one roof.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-2 font-bold text-gray-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT HAPPENS NEXT */}
      <section className="bg-gray-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-black md:text-4xl">What happens after you sign up</h2>
            <p className="text-gray-400">
              From payment to your business being live — here&apos;s exactly what to expect.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 hidden h-full w-px bg-white/10 md:left-1/2 md:block" />

            <div className="space-y-10">
              {[
                {
                  step: "01",
                  icon: "💳",
                  title: "Make payment",
                  timing: "Today",
                  desc: "Subscribe for £79/month — no setup fee, no long contract. Your subscription starts immediately and you can cancel anytime with 30 days' notice.",
                },
                {
                  step: "02",
                  icon: "📋",
                  title: "Fill out your business info form",
                  timing: "Same day",
                  desc: "Right after payment you'll receive a short onboarding form. We'll ask for your logo, brand colours, photos, service details, and any existing accounts. Takes around 10 minutes to complete.",
                },
                {
                  step: "03",
                  icon: "🎨",
                  title: "We build your website",
                  timing: "Within 3–5 working days",
                  desc: "Our team designs and builds your professional website based on your branding and services. We'll send you a preview link to review before anything goes live. Revisions included.",
                },
                {
                  step: "04",
                  icon: "🚀",
                  title: "Full platform access",
                  timing: "Live and ready",
                  desc: "Your website is published, your domain is connected, and your entire platform is configured — CRM, booking system, automations, social scheduler, business email, and more. We walk you through everything on a handover call.",
                },
              ].map((s, i) => (
                <div key={s.step} className={`relative flex flex-col gap-6 md:flex-row md:items-start ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                  {/* Icon bubble */}
                  <div className="flex shrink-0 items-center gap-4 md:w-1/2 md:justify-end md:pr-12">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl ${i % 2 === 1 ? "md:order-last" : ""}`}>
                      {s.icon}
                    </div>
                    <div className={`md:hidden`}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{s.timing}</p>
                      <h3 className="mt-0.5 text-lg font-bold">{s.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-400">{s.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-6 top-4 hidden h-3 w-3 -translate-x-1.5 rounded-full bg-emerald-500 ring-4 ring-gray-950 md:left-1/2 md:block md:-translate-x-1.5 md:top-4" />

                  {/* Text — desktop */}
                  <div className={`hidden md:block md:w-1/2 ${i % 2 === 1 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{s.timing}</p>
                    <h3 className="mt-0.5 text-lg font-bold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section id="who" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-black md:text-4xl">Built for you</h2>
            <p className="text-lg text-gray-500">
              Whether you work in a studio, at home, or online — VIV-Z works for your business.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {personas.map((p) => (
              <div
                key={p.title}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm"
              >
                <span className="text-4xl">{p.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-gray-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-black md:text-4xl">Simple, honest pricing</h2>
            <p className="text-gray-400">
              One price. Everything included. No surprises.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Value stack */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h3 className="mb-2 text-lg font-bold text-gray-300">What this is worth</h3>
              <p className="mb-6 text-sm text-gray-500">The real value of everything included in VIV-Z:</p>
              <ul className="space-y-3 text-sm">
                {[
                  ["Professional Website Design", "£1,200 one-off"],
                  ["Google My Business Setup", "£300 one-off"],
                  ["Full CRM & Contact Management", "£80/mo"],
                  ["Online Booking System", "£20/mo"],
                  ["Social Media Scheduler", "£30/mo"],
                  ["Business Email Address", "£6/mo"],
                  ["Automated Reviews System", "£40/mo"],
                  ["Unified Inbox (SMS, Email, DMs)", "£25/mo"],
                  ["Email Marketing Platform", "£20/mo"],
                  ["Domain Name", "£15/mo"],
                  ["Hosting & SSL", "£20/mo"],
                  ["UK Setup Support & Handover Call", "£200 one-off"],
                ].map(([item, cost]) => (
                  <li key={item} className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">{item}</span>
                    <span className="font-semibold text-gray-300">{cost}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between pt-2">
                  <span className="font-bold text-white">Total value</span>
                  <span className="text-right text-sm font-black text-white">£1,700+ up front<br /><span className="text-red-400">+ £256+/mo ongoing</span></span>
                </li>
              </ul>
            </div>

            {/* VIV-Z card */}
            <div className="relative rounded-2xl border-2 border-emerald-500 bg-emerald-950/50 p-8">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                Best value
              </div>
              <h3 className="mb-1 text-lg font-bold text-white">VIV-Z All-in-One</h3>
              <p className="mb-6 text-sm text-emerald-300">Everything. One subscription.</p>

              <div className="mb-2">
                <span className="text-6xl font-black text-white">£79</span>
                <span className="ml-2 text-gray-400">/month</span>
              </div>
              <p className="mb-6 text-sm font-semibold text-emerald-400">You save £177+/month vs doing it yourself</p>

              <ul className="mb-6 space-y-2.5 text-sm">
                {[
                  "Professional website (custom designed)",
                  "Online booking & client portal",
                  "Google My Business setup & optimisation",
                  "Full CRM & contact management",
                  "Lead pipeline & prospect tracking",
                  "Social media scheduler",
                  "Business email address",
                  "Email marketing & newsletters",
                  "Automated review requests",
                  "Unified inbox (SMS, email, DMs)",
                  "Missed call text-back",
                  "Smart forms & intake questionnaires",
                  "Automated follow-ups & reminders",
                  "Domain name included",
                  "Hosting & SSL included",
                  "UK-based support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-200">
                    <span className="mt-0.5 shrink-0 text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Bonuses */}
              <div className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-900/40 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-400">🎁 Sign up this month — FREE bonuses:</p>
                <ul className="space-y-1.5 text-sm text-gray-200">
                  {[
                    "30-min onboarding strategy call (value: £150)",
                    "First month's social media content calendar (value: £100)",
                    "Custom intake form setup — PAR-Q / consultation",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-emerald-400">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scarcity */}
              <p className="mb-4 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400">
                <span>⚡</span> Limited spots — we onboard a small number of clients each month to guarantee quality.
              </p>

              <Link
                href="https://link.fastpaydirect.com/payment-link/69d56afca6c96e61a84603da"
                className="block w-full rounded-xl bg-emerald-500 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-400"
              >
                Start filling my calendar →
              </Link>
              <p className="mt-3 text-center text-xs text-gray-500">30-day money-back guarantee · No setup fee · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>


      {/* GUARANTEE */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-10 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-4xl">🛡️</div>
            </div>
            <h2 className="mb-3 text-2xl font-black text-gray-900 md:text-3xl">
              Try it risk-free for 30 days.
            </h2>
            <p className="mx-auto max-w-xl leading-relaxed text-gray-600">
              If your website isn&apos;t live and you&apos;re not completely happy within 30 days of signing up, contact us and we&apos;ll refund every penny. No questions. No drama. You have nothing to lose.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-emerald-700">
              <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Full refund if not satisfied</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> No questions asked</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Your data is always exportable</span>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-black md:text-4xl">Common questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <h3 className="mb-2 font-bold text-gray-900">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-black leading-tight md:text-5xl">
            Stop losing clients to competitors with a better website.
          </h2>
          <p className="mb-8 text-lg text-emerald-100">
            Get your professional online presence set up in days — not months.
            Everything included for £79/month.
          </p>
          <Link
            href="https://link.fastpaydirect.com/payment-link/69d56afca6c96e61a84603da"
            className="inline-block rounded-xl bg-white px-10 py-5 text-base font-black text-emerald-700 shadow-xl transition hover:bg-emerald-50"
          >
            Build my online business for £79/month →
          </Link>
          <p className="mt-4 text-sm text-emerald-200">
            30-day money-back guarantee · No setup fee · Setup in 3–5 working days
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <VivZLogo size="sm" />
              <p className="mt-3 text-sm text-gray-500">
                The complete online platform for personal trainers, massage therapists, physiotherapists, and other health &amp; fitness professionals.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-emerald-600">Features</Link></li>
                <li><Link href="#who" className="hover:text-emerald-600">Who it&apos;s for</Link></li>
                <li><Link href="#pricing" className="hover:text-emerald-600">Pricing</Link></li>
                <li><Link href="#faq" className="hover:text-emerald-600">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Account</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/portal" className="hover:text-emerald-600">Client Booking Portal</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-600">Contact</Link></li>
                <li><Link href="/sign-in" className="hover:text-emerald-600">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/terms" className="hover:text-emerald-600">Terms &amp; Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} VIV-Z. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
