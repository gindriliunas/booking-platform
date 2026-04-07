import Link from "next/link";
import { VivZLogo } from "@/components/marketing/logo";
import { LeadCalculator } from "@/components/marketing/lead-calculator";
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
            <Link href="/portal" className="transition hover:text-emerald-400">Client Login</Link>
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
            Your complete online business.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Ready in days, not months.
            </span>
          </h1>

          <p className="mx-auto mb-4 max-w-3xl text-center text-lg text-gray-300 md:text-xl">
            Professional website, online booking, CRM, social media, reviews, SEO, SMS, automations, business email, domain &amp; hosting —{" "}
            <strong className="text-white">all included for one flat monthly price.</strong>
          </p>

          <p className="mb-10 text-center text-2xl font-black text-emerald-400">
            £79 / month. Everything included. No setup fees.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="#pricing"
              className="rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-emerald-400"
            >
              Get your website built →
            </Link>
            <Link
              href="#features"
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              See everything included
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            {["No long contracts", "Cancel anytime", "Live within 3–5 days", "UK-based support"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span> {t}
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

      {/* HOW IT WORKS */}
      <section className="bg-gray-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-black md:text-4xl">Up and running in 3 steps</h2>
            <p className="text-gray-400">
              We do the heavy lifting. You focus on your clients.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "We build your website",
                desc: "Send us your logo, brand colours, photos, and a few details about your services. We design and build your professional website within 3–5 working days.",
              },
              {
                step: "02",
                title: "We set up your platform",
                desc: "Your CRM, booking system, automations, social scheduler, review requests, web chat, and business email are all configured and ready.",
              },
              {
                step: "03",
                title: "You go live and grow",
                desc: "Your complete online business is live. Clients find you on Google, book online, and your platform handles the rest automatically.",
              },
            ].map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="mb-4 text-5xl font-black text-emerald-500/30">{s.step}</div>
                <h3 className="mb-3 text-xl font-bold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{s.desc}</p>
              </div>
            ))}
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
            {/* What you'd pay elsewhere */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h3 className="mb-2 text-lg font-bold text-gray-300">What you pay doing it yourself</h3>
              <p className="mb-6 text-sm text-gray-500">Typical costs hiring separately + tool subscriptions:</p>
              <ul className="space-y-3 text-sm">
                {[
                  ["Freelance web designer", "£500–£2,000 one-off"],
                  ["Website hosting (Wix / Squarespace)", "£20–£35/mo"],
                  ["SEO expert / agency", "£300–£800/mo"],
                  ["Online booking (Calendly / Acuity)", "£12–£20/mo"],
                  ["CRM (HubSpot / Pipedrive)", "£45–£80/mo"],
                  ["Social scheduler (Buffer / Hootsuite)", "£15–£30/mo"],
                  ["Business email (Google Workspace)", "£6/mo"],
                  ["Review tools", "£20–£40/mo"],
                  ["SMS platform", "£15–£25/mo"],
                  ["Email marketing (Mailchimp)", "£13–£20/mo"],
                  ["GMB setup (agency fee)", "£100–£300 one-off"],
                  ["Domain + hosting", "£15–£20/mo"],
                ].map(([item, cost]) => (
                  <li key={item} className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">{item}</span>
                    <span className="font-semibold text-red-400">{cost}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between pt-2">
                  <span className="font-bold text-white">Monthly ongoing</span>
                  <span className="text-xl font-black text-red-400">£561–£1,170+/mo</span>
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

              <div className="mb-6">
                <span className="text-6xl font-black text-white">£79</span>
                <span className="ml-2 text-gray-400">/month</span>
              </div>

              <ul className="mb-8 space-y-2.5 text-sm">
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

              <Link
                href="mailto:hello@viv-z.com"
                className="block w-full rounded-xl bg-emerald-500 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-400"
              >
                Get started today →
              </Link>
              <p className="mt-3 text-center text-xs text-gray-500">No setup fee · No long contract · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {/* LEAD CALCULATOR */}
      <section id="calculator" className="bg-gray-950 px-6 py-20">
        <LeadCalculator />
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
            href="mailto:hello@viv-z.com"
            className="inline-block rounded-xl bg-white px-10 py-5 text-base font-black text-emerald-700 shadow-xl transition hover:bg-emerald-50"
          >
            Get your website built today →
          </Link>
          <p className="mt-4 text-sm text-emerald-200">
            Reply within 24 hours · Setup complete in 3–5 working days
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
