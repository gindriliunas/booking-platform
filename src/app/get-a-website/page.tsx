import Script from "next/script";
import { MarketingSiteHeader } from "@/components/marketing/site-header";

export default function GetAWebsitePage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0b", color: "#f5f5f7" }}>
      <MarketingSiteHeader />

      <main className="mx-auto max-w-2xl px-6 py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <span
            className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em]"
            style={{ background: "rgba(255,91,4,0.15)", color: "#ff5b04" }}
          >
            Free website build
          </span>
          <h1
            className="mt-6"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "#f5f5f7",
            }}
          >
            Get your professional
            <br />website
          </h1>
          <p className="mt-4 leading-relaxed" style={{ color: "rgba(245,245,247,0.45)", fontSize: "1.05rem" }}>
            Fill in your details and we&apos;ll build your website. You&apos;ll receive a
            live preview within 24 hours — no card required.
          </p>
        </div>

        {/* GHL form */}
        <div
          className="rounded-2xl"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <iframe
            src="https://api.leadconnectorhq.com/widget/form/IkXVLs3eN8Jq3tDl7CtH"
            style={{ width: "100%", height: 1376, border: "none", display: "block" }}
            id="inline-IkXVLs3eN8Jq3tDl7CtH"
            data-layout={`{"id":"INLINE"}`}
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="VIV-Z"
            data-height="1376"
            data-layout-iframe-id="inline-IkXVLs3eN8Jq3tDl7CtH"
            data-form-id="IkXVLs3eN8Jq3tDl7CtH"
            title="VIV-Z"
            scrolling="no"
          />
        </div>

        <p className="mt-5 text-center text-xs" style={{ color: "rgba(245,245,247,0.25)" }}>
          No card required · Pay for hosting only if you love it
        </p>
      </main>

      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
    </div>
  );
}
