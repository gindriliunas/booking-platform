import Script from "next/script";
import { MarketingSiteHeader } from "@/components/marketing/site-header";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata = {
  title: "Contact Us — VIV-Z",
  description: "Get in touch with the VIV-Z team. We'll get back to you within 24 hours.",
};

const INK = "#0a0a0b";
const PAPER = "#f5f5f7";
const ACCENT = "#ff5b04";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(245,245,247,0.45)";

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ background: INK, color: PAPER }}>
      <MarketingSiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b px-6 py-16 md:py-20" style={{ borderColor: BORDER }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(ellipse 80% 55% at 50% -10%, ${ACCENT}22 0%, transparent 55%)`,
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span
            className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-semibold"
            style={{ borderColor: `${ACCENT}44`, background: `${ACCENT}14`, color: ACCENT }}
          >
            We&apos;re here to help
          </span>
          <h1 className="mb-4 text-4xl font-black leading-tight md:text-5xl" style={{ color: PAPER }}>
            Get in touch
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: MUTED }}>
            Questions, briefs, or anything you want to run past us — send a message and we&apos;ll reply personally.
          </p>
        </div>
      </section>

      {/* FORM + SIDEBAR */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-16 md:grid-cols-[1fr_2fr]">
          {/* Left — brief context */}
          <div className="space-y-6 md:pt-2">
            <div>
              <h2 className="mb-3 text-xl font-black" style={{ color: PAPER }}>
                Contact us
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                Use the form — share what you&apos;re looking for and the best way to reach you. We read every message and aim to respond within 24 hours on working days.
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(245,245,247,0.38)" }}>
              No obligation — whether it&apos;s a quick question or a fuller brief, we&apos;ll reply in plain language.
            </p>
          </div>

          {/* Right — marketing form embed */}
          <div className="rounded-2xl border p-2 shadow-sm" style={{ borderColor: BORDER, background: "rgba(255,255,255,0.03)" }}>
            <iframe
              src="https://api.leadconnectorhq.com/widget/form/IkXVLs3eN8Jq3tDl7CtH"
              style={{ width: "100%", border: "none", minHeight: "600px" }}
              id="IkXVLs3eN8Jq3tDl7CtH"
              title="Contact VIV-Z"
              scrolling="no"
            />
            <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
          </div>
        </div>
      </section>

      <MarketingFooter variant="dark" />
    </div>
  );
}
