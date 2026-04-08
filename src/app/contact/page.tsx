import Script from "next/script";
import Link from "next/link";
import { VivZLogo } from "@/components/marketing/logo";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata = {
  title: "Contact Us — VIV-Z",
  description: "Get in touch with the VIV-Z team. We'll get back to you within 24 hours.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAV */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" aria-label="VIV-Z Home">
            <VivZLogo size="sm" className="[&_span]:text-white" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-300 md:flex">
            <Link href="/#features" className="transition hover:text-emerald-400">Features</Link>
            <Link href="/#who" className="transition hover:text-emerald-400">Who it&apos;s for</Link>
            <Link href="/#pricing" className="transition hover:text-emerald-400">Pricing</Link>
            <Link href="/contact" className="text-emerald-400">Contact</Link>
            <Link href="/sign-in" className="transition hover:text-emerald-400">Business Login</Link>
          </nav>
          <Link
            href="/#pricing"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-emerald-400"
          >
            Get Started — £79/mo
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gray-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400">
            We&apos;re here to help
          </span>
          <h1 className="mb-4 text-4xl font-black leading-tight md:text-5xl">
            Get in touch
          </h1>
          <p className="text-lg text-gray-400">
            Have a question before signing up? Want to know if VIV-Z is right for your business?
            Fill out the form and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* FORM + SIDEBAR */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-16 md:grid-cols-[1fr_2fr]">

          {/* Left — info */}
          <div className="space-y-10">
            <div>
              <h2 className="mb-4 text-xl font-black text-gray-900">What happens next</h2>
              <ol className="space-y-4 text-sm text-gray-600">
                {[
                  { n: "1", t: "Submit your message", d: "Fill out the form with your details and question." },
                  { n: "2", t: "We reply within 24 hours", d: "A real person from the VIV-Z team will respond — no bots." },
                  { n: "3", t: "Get set up fast", d: "If you're ready to go, your platform can be live within 3–5 working days." },
                ].map((s) => (
                  <li key={s.n} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                      {s.n}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{s.t}</p>
                      <p className="mt-0.5 text-gray-500">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black text-gray-900">Already subscribed?</h2>
              <p className="text-sm text-gray-500">
                Log in to your dashboard or visit our support page.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:border-emerald-400 hover:text-emerald-600"
                >
                  Business Login
                </Link>
                <Link
                  href="/support"
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:border-emerald-400 hover:text-emerald-600"
                >
                  Support Centre
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-900">Ready to get started?</p>
              <p className="mt-1 text-sm text-emerald-700">
                No setup fee. Cancel anytime. Live in 3–5 days.
              </p>
              <Link
                href="https://link.fastpaydirect.com/payment-link/69d56afca6c96e61a84603da"
                className="mt-4 block w-full rounded-lg bg-emerald-500 py-2.5 text-center text-sm font-bold text-white transition hover:bg-emerald-400"
              >
                Get Started — £79/mo
              </Link>
            </div>
          </div>

          {/* Right — GHL form embed */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-2 shadow-sm">
            <iframe
              src="https://api.leadconnectorhq.com/widget/form/IkXVLs3eN8Jq3tDl7CtH"
              style={{ width: "100%", border: "none", minHeight: "600px" }}
              id="IkXVLs3eN8Jq3tDl7CtH"
              title="Contact VIV-Z"
              scrolling="no"
            />
            <Script
              src="https://link.msgsndr.com/js/form_embed.js"
              strategy="lazyOnload"
            />
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
