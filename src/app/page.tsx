import Link from "next/link";
import Image from "next/image";
import { VivZWordmark } from "@/components/marketing/logo";
import { MarketingSiteHeader } from "@/components/marketing/site-header";
import { CustomCursor } from "@/components/marketing/cursor";
import { HeroSpotlight, HeroBgBlobs } from "@/components/marketing/hero-interactive";
import { Tilt } from "@/components/marketing/tilt";
import { Counter } from "@/components/marketing/counter";

// ─── palette ──────────────────────────────────────────────────
const INK    = "#0a0a0b";
const PAPER  = "#f5f5f7";
const ACCENT = "#ff5b04";
const MUTED  = "rgba(245,245,247,0.45)";
const BORDER = "rgba(255,255,255,0.08)";

// ─── data ─────────────────────────────────────────────────────
const features = [
  { num: "01", title: "Mobile-first", desc: "Tested on real devices — every pixel perfect on any screen size." },
  { num: "02", title: "Brand-accurate design", desc: "Your colours, fonts, tone. Not a theme — a real site built for you." },
  { num: "03", title: "SEO from day one", desc: "Structured data, Core Web Vitals, sitemap — baked in on every build." },
  { num: "04", title: "Contact form included", desc: "Leads straight to your inbox. No third-party tools, no monthly add-ons." },
  { num: "05", title: "Edge-hosted globally", desc: "CDN-deployed. Sub-second loads worldwide, every time." },
  { num: "06", title: "Your domain, connected", desc: "Use your existing domain or we'll help you get one. Done in minutes." },
];

const caseStudies = [
  {
    name: "Felipe Rodas",
    type: "Personal Trainer · London",
    quote: "I had my website live within 24 hours. It looks incredible and I've already had new enquiries from Google.",
    url: "https://www.feliperodas.co.uk",
    domain: "feliperodas.co.uk",
    accent: "#ff5b04",
    bg: `radial-gradient(ellipse at 30% 30%, rgba(255,91,4,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(120,50,255,0.12) 0%, transparent 60%), #0d0d10`,
    imageSrc: "https://image.thum.io/get/width/1280/crop/800/https://www.feliperodas.co.uk",
  },
  {
    name: "GI Training",
    type: "Personal Training · UK",
    quote: "Couldn't believe they built the whole thing before I paid anything. The design is exactly what I wanted.",
    url: "https://www.gitraining.co.uk",
    domain: "gitraining.co.uk",
    accent: "#22c55e",
    bg: `radial-gradient(ellipse at 70% 20%, rgba(34,197,94,0.2) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(255,91,4,0.1) 0%, transparent 60%), #0d100d`,
    imageSrc: "/GI Training Website.png",
  },
  {
    name: "Skills 4 2 U",
    type: "First Aid Training · UK-wide",
    quote: "Professional, fast, and genuinely helpful. Our new site has made a huge difference to how people perceive us.",
    url: "https://www.skills42u.com",
    domain: "skills42u.com",
    accent: "#3b82f6",
    bg: `radial-gradient(ellipse at 60% 30%, rgba(59,130,246,0.2) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(255,91,4,0.08) 0%, transparent 60%), #0d0f14`,
    imageSrc: "/Skills42U Website.png",
  },
  {
    name: "FleetGS",
    type: "Fleet Management · UK",
    quote: "From brief to live preview in under a day. Exactly what we needed — professional, clean, and built around our product.",
    url: "https://www.fleetgs.com",
    domain: "fleetgs.com",
    accent: "#10b981",
    bg: `radial-gradient(ellipse at 60% 20%, rgba(16,185,129,0.2) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.08) 0%, transparent 60%), #0d1210`,
    imageSrc: "/FleetGS Website.png",
  },
  {
    name: "Plumbing Boss",
    type: "Plumbing & Heating · UK",
    quote: "Our new site looks completely professional. We started getting enquiries through the contact form within the first week.",
    url: "https://www.plumbingboss.co.uk",
    domain: "plumbingboss.co.uk",
    accent: "#06b6d4",
    bg: `radial-gradient(ellipse at 60% 20%, rgba(6,182,212,0.2) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.1) 0%, transparent 60%), #0d1114`,
    imageSrc: "/Plumbing Boss.png",
  },
  {
    name: "Leaf It Out",
    type: "Gardening & Landscaping · UK",
    quote: "The site looks exactly how I imagined it. Clean, professional, and I was live within a day.",
    url: "https://www.leaf-it-out.co.uk",
    domain: "leaf-it-out.co.uk",
    accent: "#4ade80",
    bg: `radial-gradient(ellipse at 40% 20%, rgba(74,222,128,0.22) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(16,185,129,0.1) 0%, transparent 60%), #0a1009`,
    imageSrc: "https://image.thum.io/get/width/1280/crop/800/https://www.leaf-it-out.co.uk",
  },
  {
    name: "A Cut Above Hair Salon",
    type: "Hair Salon · UK",
    quote: "Absolutely love the website. It's elegant, easy to navigate, and our clients keep complimenting it.",
    url: "https://www.acutabovehairsalon.co.uk",
    domain: "acutabovehairsalon.co.uk",
    accent: "#f472b6",
    bg: `radial-gradient(ellipse at 50% 20%, rgba(244,114,182,0.22) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.1) 0%, transparent 60%), #110a10`,
    imageSrc: "https://image.thum.io/get/width/1280/crop/800/https://www.acutabovehairsalon.co.uk",
  },
];

const faqs = [
  { q: "Is the website build really free?", a: "Yes — completely free. We design and build your full website before you pay anything. You only start paying when you've seen the finished result and decided to go live." },
  { q: "What are the running costs?", a: "You only pay for hosting to keep your website active — that includes SSL, your custom domain connected, and the site staying online. No hidden fees, no setup charges." },
  { q: "How long does it take?", a: "We'll have your live preview ready within 24 hours of receiving your details. Most clients are live on their domain the same day they subscribe." },
  { q: "What if I don't like the design?", a: "Tell us what you'd like changed and we'll revise it — before you pay anything. You only subscribe once you're happy." },
  { q: "I already have a website. Can you replace it?", a: "Yes. We'll build you a new one, you review the preview, and when you're ready just connect your domain. Your old site is replaced seamlessly." },
  { q: "Can I use my own domain?", a: "Absolutely. Once you subscribe, just let us know your domain and we'll connect it. If you don't have one, a .co.uk costs around £8/year from Namecheap." },
  { q: "What happens if I cancel?", a: "Cancel anytime — no penalties, no contracts. Your site goes offline when you stop your subscription." },
  { q: "Do I need any technical knowledge?", a: "None at all. Fill in a short form, view your preview, and if you love it just tell us your domain. We handle everything else." },
];

const marqueeItems = [
  "Free to build", "Preview within 24 hours", "Hosting when you go live", "Booking portal included with hosting",
  "100+ websites delivered", "Mobile-optimised", "SEO-ready", "No contracts",
  "Professional design", "Edge hosting", "SSL included", "Domain connected",
];

const styles = [
  {
    key: "minimal",
    label: "Clean & Minimal",
    desc: "Lots of space, clean lines, confident typography. Timeless.",
    bg: "#f7f6f1",
    text: "#111",
    accent: "#1d4ed8",
    mockBg: "linear-gradient(135deg, #f7f6f1 0%, #ece9e0 100%)",
    navColor: "#111",
    headColor: "#111",
    btnColor: "#1d4ed8",
  },
  {
    key: "bold",
    label: "Bold & Modern",
    desc: "Strong type, vivid colour hits, high contrast. Unforgettable.",
    bg: "#0f0f0f",
    text: "#fff",
    accent: "#ff5b04",
    mockBg: "linear-gradient(135deg, #0f0f0f 0%, #1a0a00 100%)",
    navColor: "rgba(255,255,255,0.7)",
    headColor: "#fff",
    btnColor: "#ff5b04",
  },
  {
    key: "cinematic",
    label: "Cinematic 3D",
    desc: "Immersive animations, depth layers, premium studio feel.",
    bg: "#050509",
    text: "#e8e8f0",
    accent: "#a78bfa",
    mockBg: "linear-gradient(135deg, #050509 0%, #0d0520 100%)",
    navColor: "rgba(232,232,240,0.6)",
    headColor: "#e8e8f0",
    btnColor: "#a78bfa",
  },
];

// ─── sub-components ────────────────────────────────────────────

function NoiseOverlay() {
  return (
    <>
      <svg style={{ position: "fixed", width: 0, height: 0 }}>
        <defs>
          <filter id="noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          position: "fixed",
          inset: 0,
          filter: "url(#noise-filter)",
          opacity: 0.032,
          pointerEvents: "none",
          zIndex: 9998,
          mixBlendMode: "overlay",
        }}
      />
    </>
  );
}

function BrowserMockup({
  domain,
  bg,
  accent,
  imageSrc,
  className,
  style,
}: {
  domain: string;
  bg: string;
  accent: string;
  imageSrc?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${BORDER}`,
        boxShadow: `0 48px 96px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)`,
        width: "100%",
        ...style,
      }}
    >
      {imageSrc ? (
        <div style={{ position: "relative", aspectRatio: "16/10", width: "100%" }}>
          <Image
            src={imageSrc}
            alt={domain}
            fill
            style={{ objectFit: "cover", objectPosition: "top" }}
            sizes="(max-width: 768px) 100vw, 480px"
          />
        </div>
      ) : (
        <>
          {/* Chrome bar */}
          <div
            style={{
              background: "rgba(20,20,22,0.95)",
              backdropFilter: "blur(12px)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
                <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}66` }} />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 7,
                padding: "4px 12px",
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "monospace",
                letterSpacing: "0.02em",
              }}
            >
              {domain}
            </div>
          </div>

          {/* Website content */}
          <div
            className="shimmer"
            style={{ background: bg, height: 380, position: "relative", overflow: "hidden" }}
          >
            {/* Fake nav */}
            <div
              style={{
                position: "relative",
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ width: 64, height: 9, borderRadius: 5, background: "rgba(255,255,255,0.35)" }} />
              <div style={{ display: "flex", gap: 14 }}>
                {[40, 32, 44].map((w, i) => (
                  <div key={i} style={{ width: w, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.18)" }} />
                ))}
              </div>
              <div style={{ width: 76, height: 26, borderRadius: 13, background: accent, opacity: 0.9 }} />
            </div>

            {/* Fake hero */}
            <div style={{ padding: "28px 22px" }}>
              <div style={{ width: "55%", height: 9, borderRadius: 5, background: "rgba(255,255,255,0.14)", marginBottom: 12 }} />
              <div style={{ width: "82%", height: 22, borderRadius: 7, background: "rgba(255,255,255,0.55)", marginBottom: 8 }} />
              <div style={{ width: "68%", height: 22, borderRadius: 7, background: accent, opacity: 0.75, marginBottom: 18 }} />
              <div style={{ width: "60%", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.22)", marginBottom: 5 }} />
              <div style={{ width: "50%", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.15)", marginBottom: 22 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ width: 130, height: 38, borderRadius: 19, background: accent }} />
                <div style={{ width: 110, height: 38, borderRadius: 19, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }} />
              </div>
            </div>

            {/* Bottom cards strip */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.2)",
                padding: "14px 20px",
                display: "flex",
                gap: 10,
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                />
              ))}
            </div>

            {/* Gradient overlay at top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 80,
                background: `radial-gradient(ellipse at 50% 0%, ${accent}22 0%, transparent 80%)`,
                pointerEvents: "none",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function MinimalPreview() {
  return (
    <div style={{ background: "#f9f8f4", padding: "18px 18px 0" }}>
      {/* Light browser chrome */}
      <div style={{ background: "#e8e6e0", borderRadius: "10px 10px 0 0", padding: "7px 12px", display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
            <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 13, background: "rgba(0,0,0,0.07)", borderRadius: 4 }} />
      </div>
      {/* Site content */}
      <div style={{ background: "#f9f8f4", padding: "16px 16px 20px" }}>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 32, height: 5, borderRadius: 2, background: "#111", opacity: 0.8 }} />
          <div style={{ display: "flex", gap: 10 }}>
            {[20, 14, 22].map((w, i) => (
              <div key={i} style={{ width: w, height: 4, borderRadius: 2, background: "#111", opacity: 0.2 }} />
            ))}
          </div>
          <div style={{ width: 52, height: 18, borderRadius: 9, border: "1px solid #1d4ed8", background: "transparent" }} />
        </div>
        {/* Two-column layout */}
        <div style={{ display: "flex", gap: 14 }}>
          {/* Left: text */}
          <div style={{ flex: 1 }}>
            <div style={{ width: "50%", height: 4, borderRadius: 2, background: "#1d4ed8", opacity: 0.6, marginBottom: 8 }} />
            <div style={{ width: "95%", height: 8, borderRadius: 3, background: "#111", opacity: 0.75, marginBottom: 5 }} />
            <div style={{ width: "80%", height: 8, borderRadius: 3, background: "#111", opacity: 0.75, marginBottom: 12 }} />
            <div style={{ width: "100%", height: 1, background: "#111", opacity: 0.1, marginBottom: 10 }} />
            {[90, 75, 60].map((w, i) => (
              <div key={i} style={{ width: `${w}%`, height: 4, borderRadius: 2, background: "#111", opacity: 0.18, marginBottom: 5 }} />
            ))}
            <div style={{ marginTop: 14, width: 64, height: 20, borderRadius: 10, border: "1.5px solid #1d4ed8", background: "transparent" }} />
          </div>
          {/* Right: image placeholder */}
          <div style={{
            width: 80, flexShrink: 0, borderRadius: 8,
            background: "linear-gradient(135deg, #e8e6e0 0%, #d4d0c8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.08)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BoldPreview() {
  return (
    <div style={{ background: "#0a0a0a", padding: "18px 18px 0" }}>
      {/* Dark chrome */}
      <div style={{ background: "#1a1a1a", borderRadius: "10px 10px 0 0", padding: "7px 12px", display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
            <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 13, background: "rgba(255,255,255,0.06)", borderRadius: 4 }} />
      </div>
      {/* Site content */}
      <div style={{ background: "#0a0a0a", padding: "16px 16px 20px", position: "relative", overflow: "hidden" }}>
        {/* Top glow */}
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,91,4,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ width: 28, height: 6, borderRadius: 2, background: "#fff", opacity: 0.9 }} />
          <div style={{ display: "flex", gap: 8 }}>
            {[18, 14, 20].map((w, i) => (
              <div key={i} style={{ width: w, height: 4, borderRadius: 2, background: "#fff", opacity: 0.2 }} />
            ))}
          </div>
        </div>
        {/* Massive headline */}
        <div style={{ width: "100%", height: 16, borderRadius: 4, background: "#fff", opacity: 0.9, marginBottom: 6 }} />
        <div style={{ width: "88%", height: 16, borderRadius: 4, background: "#fff", opacity: 0.9, marginBottom: 6 }} />
        <div style={{ width: "70%", height: 16, borderRadius: 4, background: "#ff5b04", marginBottom: 14 }} />
        {/* Subtext */}
        <div style={{ width: "65%", height: 5, borderRadius: 2, background: "#fff", opacity: 0.25, marginBottom: 4 }} />
        <div style={{ width: "50%", height: 5, borderRadius: 2, background: "#fff", opacity: 0.18, marginBottom: 16 }} />
        {/* Big CTA */}
        <div style={{ width: 110, height: 28, borderRadius: 14, background: "#ff5b04", boxShadow: "0 4px 20px rgba(255,91,4,0.45)" }} />
      </div>
    </div>
  );
}

function CinematicPreview() {
  return (
    <div style={{ background: "#050509", padding: "18px 18px 0" }}>
      {/* Very dark chrome */}
      <div style={{ background: "#0d0d12", borderRadius: "10px 10px 0 0", padding: "7px 12px", display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
            <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 13, background: "rgba(255,255,255,0.04)", borderRadius: 4 }} />
      </div>
      {/* Site content */}
      <div style={{ background: "#050509", padding: "16px 16px 20px", position: "relative", overflow: "hidden" }}>
        {/* Purple blob glow */}
        <div style={{ position: "absolute", top: -10, left: "20%", width: 120, height: 80, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(167,139,250,0.35) 0%, transparent 70%)", filter: "blur(16px)", pointerEvents: "none" }} />
        {/* Grid pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(167,139,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.04) 1px, transparent 1px)", backgroundSize: "18px 18px", pointerEvents: "none" }} />
        {/* Nav */}
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ width: 28, height: 5, borderRadius: 2, background: "#e8e8f0", opacity: 0.7 }} />
          <div style={{ width: 22, height: 16, borderRadius: 5, border: "1px solid rgba(167,139,250,0.4)", background: "rgba(167,139,250,0.08)" }} />
        </div>
        {/* Eyebrow */}
        <div style={{ position: "relative", width: 55, height: 4, borderRadius: 2, background: "#a78bfa", opacity: 0.7, marginBottom: 10 }} />
        {/* Headline */}
        <div style={{ position: "relative", width: "95%", height: 11, borderRadius: 4, background: "#e8e8f0", opacity: 0.85, marginBottom: 5 }} />
        <div style={{ position: "relative", width: "75%", height: 11, borderRadius: 4, background: "#a78bfa", opacity: 0.8, marginBottom: 14 }} />
        {/* Floating card */}
        <div style={{
          position: "relative",
          width: "100%",
          height: 38,
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(167,139,250,0.2)",
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: "70%", height: 4, borderRadius: 2, background: "#e8e8f0", opacity: 0.5, marginBottom: 4 }} />
            <div style={{ width: "45%", height: 3, borderRadius: 2, background: "#a78bfa", opacity: 0.5 }} />
          </div>
          <div style={{ width: 28, height: 14, borderRadius: 7, background: "rgba(167,139,250,0.3)", border: "1px solid rgba(167,139,250,0.4)" }} />
        </div>
      </div>
    </div>
  );
}

function StyleCard({ s }: { s: typeof styles[0] }) {
  return (
    <Tilt
      style={{
        borderRadius: 20,
        overflow: "hidden",
        border: s.key === "minimal" ? "1px solid rgba(0,0,0,0.08)" : `1px solid ${BORDER}`,
        cursor: "pointer",
      }}
    >
      {s.key === "minimal" && <MinimalPreview />}
      {s.key === "bold" && <BoldPreview />}
      {s.key === "cinematic" && <CinematicPreview />}

      {/* Label */}
      <div style={{
        padding: "18px 20px 20px",
        background: s.key === "minimal" ? "#f2f1ec" : "#0d0d10",
        borderTop: s.key === "minimal" ? "1px solid rgba(0,0,0,0.06)" : `1px solid ${BORDER}`,
      }}>
        <p style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.02em", color: s.key === "minimal" ? "#111" : PAPER, marginBottom: 4 }}>
          {s.label}
        </p>
        <p style={{ fontSize: "0.82rem", color: s.key === "minimal" ? "rgba(0,0,0,0.45)" : MUTED, lineHeight: 1.55 }}>{s.desc}</p>
      </div>
    </Tilt>
  );
}

// ─── page ──────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: INK, color: PAPER, overflowX: "hidden" }}>
      <CustomCursor />
      <NoiseOverlay />
      <HeroSpotlight />

      {/* ── NAV ─────────────────────────────────────────────── */}
      <MarketingSiteHeader />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden px-6 pt-24 pb-20">
        <HeroBgBlobs />

        {/* Floating geometric accents */}
        <div className="pointer-events-none absolute" style={{ top: "12%", right: "8%", width: 180, height: 180, opacity: 0.06 }}>
          <div className="spin-slow" style={{ width: "100%", height: "100%", border: `1px solid ${ACCENT}`, borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }} />
        </div>
        <div className="pointer-events-none absolute" style={{ bottom: "15%", left: "3%", width: 120, height: 120, opacity: 0.04 }}>
          <div className="float-slow" style={{ width: "100%", height: "100%", border: "1px solid rgba(245,245,247,0.6)", borderRadius: "50%" }} />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-8">
          {/* Left — copy */}
          <div>
            <p className="hero-eyebrow mb-8 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: "rgba(245,245,247,0.3)" }}>
              Website Design Studio
            </p>

            <h1
              className="hero-h1"
              style={{
                fontSize: "clamp(3rem, 8vw, 7rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.92,
                color: PAPER,
              }}
            >
              Your website,
              <br />
              <span style={{ color: ACCENT }}>built free.</span>
            </h1>

            <p
              className="hero-sub mt-8 font-light leading-relaxed"
              style={{ fontSize: "clamp(1.05rem, 1.6vw, 1.25rem)", color: MUTED, maxWidth: "46ch" }}
            >
              We design and build your complete professional website before you
              pay a penny. Preview it. Love it. Hosting keeps your site live — and includes our{" "}
              <strong style={{ color: PAPER }}>client booking portal free</strong>, no separate add-on.
            </p>

            <div className="hero-cta mt-12 flex flex-wrap items-center gap-5">
              <Link
                href="/get-a-website"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 text-sm font-bold text-white transition-all duration-500 hover:gap-5 hover:scale-[1.03] hover:brightness-110"
                style={{ background: ACCENT }}
              >
                <span className="relative z-10">Claim your free website</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="#examples"
                className="inline-flex items-center gap-2 text-sm transition-colors duration-300 hover:text-[#f5f5f7]"
                style={{ color: "rgba(245,245,247,0.3)" }}
              >
                See our work
                <span style={{ fontSize: "0.7rem" }}>↓</span>
              </a>
            </div>

            {/* Stats */}
            <div className="hero-stats mt-20 flex flex-wrap gap-10">
              {[
                { value: 100, suffix: "+", label: "websites built" },
                { value: 24, suffix: "h", label: "avg build time" },
              ].map((s) => (
                <div key={s.label}>
                  <p style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em", color: PAPER, lineHeight: 1 }}>
                    <Counter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-xs uppercase tracking-[0.2em]" style={{ color: "rgba(245,245,247,0.3)" }}>{s.label}</p>
                </div>
              ))}
              <div>
                <p style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", fontWeight: 900, color: ACCENT, lineHeight: 1 }}>★★★★★</p>
                <p className="mt-1.5 text-xs uppercase tracking-[0.2em]" style={{ color: "rgba(245,245,247,0.3)" }}>5-star reviews</p>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="mt-16 hidden lg:flex items-center gap-3" style={{ color: "rgba(245,245,247,0.2)" }}>
              <div style={{ width: 24, height: 40, borderRadius: 12, border: "1px solid rgba(245,245,247,0.15)", position: "relative", overflow: "hidden" }}>
                <div className="scroll-dot" style={{ position: "absolute", left: "50%", top: 6, transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: ACCENT }} />
              </div>
              <span className="text-xs tracking-[0.25em] uppercase">Scroll to explore</span>
            </div>
          </div>

          {/* Right — floating browser mockup */}
          <div className="hidden lg:block relative">
            {/* Glow behind the mockup */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 500,
                height: 400,
                background: `radial-gradient(ellipse, ${ACCENT}20 0%, transparent 70%)`,
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />
            <div className="float-browser">
              <BrowserMockup
                domain="yourwebsite.co.uk"
                bg={`radial-gradient(ellipse at 35% 25%, ${ACCENT}33 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(124,58,237,0.15) 0%, transparent 55%), #0d0d10`}
                accent={ACCENT}
              />
            </div>
            {/* Floating badge */}
            <div
              className="float-medium absolute -bottom-6 -left-8 rounded-2xl px-5 py-4"
              style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)", border: `1px solid ${BORDER}`, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: MUTED }}>Built & delivered</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.03em", color: PAPER, lineHeight: 1.1 }}>in 24 hours</p>
            </div>
            {/* Free badge */}
            <div
              className="float-slow absolute -top-4 -right-6 rounded-2xl px-5 py-4"
              style={{ background: `${ACCENT}18`, backdropFilter: "blur(16px)", border: `1px solid ${ACCENT}33`, boxShadow: "0 20px 40px rgba(255,91,4,0.15)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Build price</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.04em", color: PAPER, lineHeight: 1.1 }}>FREE</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-5"
        style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: "rgba(255,91,4,0.03)" }}
      >
        <div className="marquee-track flex w-max gap-14 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-14">
              <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "rgba(245,245,247,0.35)" }}>{item}</span>
              <span style={{ color: `${ACCENT}55`, fontSize: "0.35rem" }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── WEBSITE STYLES SHOWCASE ──────────────────────────── */}
      <section className="px-6 py-32" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 grid lg:grid-cols-2 lg:items-end gap-8">
            <div>
              <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>What we build</p>
              <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: PAPER }}>
                Three styles.<br />
                <span style={{ color: "rgba(245,245,247,0.25)" }}>All stunning.</span>
              </h2>
            </div>
            <p className="reveal" style={{ color: MUTED, lineHeight: 1.7, maxWidth: "46ch", fontSize: "1.05rem" }}>
              When you apply, tell us which style you'd like. We'll build it
              around your brand — colours, fonts, voice, everything.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {styles.map((s, i) => (
              <div key={s.key} className={`reveal${i > 0 ? `-delay-${i}` : ""}`}>
                <StyleCard s={s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-20">
            <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>The process</p>
            <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: PAPER }}>
              Zero risk.<br />
              <span style={{ color: "rgba(245,245,247,0.25)" }}>Four steps.</span>
            </h2>
          </div>

          <div className="grid gap-px" style={{ background: BORDER }}>
            {[
              { num: "01", title: "Tell us about your business", desc: "Fill in a short form — your name, brand colours, what you do, and your preferred style. Five minutes, zero commitment." },
              { num: "02", title: "We build your website", desc: "Our designers build your complete, custom site. Not a template — a real site built around your brand, your voice, your clients." },
              { num: "03", title: "Preview it. For free.", desc: "Within 24 hours you receive a link to your live preview. Browse it on your phone. Ask for changes. You owe us nothing." },
              { num: "04", title: "Go live — hosting keeps it active", desc: "Happy? Subscribe for hosting, connect your domain, and your site stays live. Not happy? Walk away. No invoice, no awkward conversation." },
            ].map((step, i) => (
              <Tilt
                key={step.num}
                intensity={3}
                className={`reveal${i > 0 ? `-delay-${Math.min(i, 3)}` : ""}`}
                style={{
                  background: INK,
                  borderRadius: 0,
                  cursor: "default",
                }}
              >
                <div
                  className="flex gap-8 p-8 md:p-12 transition-colors duration-500 hover:bg-white/[0.025]"
                  style={{ position: "relative" }}
                >
                  {/* Step number large */}
                  <span
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                      fontWeight: 900,
                      letterSpacing: "-0.05em",
                      color: `${ACCENT}22`,
                      lineHeight: 1,
                      flexShrink: 0,
                      minWidth: "3.5rem",
                      userSelect: "none",
                    }}
                  >
                    {step.num}
                  </span>
                  <div className="pt-1">
                    <h3 className="mb-3" style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)", fontWeight: 700, letterSpacing: "-0.02em", color: PAPER }}>
                      {step.title}
                    </h3>
                    <p style={{ color: MUTED, lineHeight: 1.75, maxWidth: "58ch" }}>{step.desc}</p>
                  </div>
                  {/* Accent line on hover */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: `linear-gradient(to bottom, transparent, ${ACCENT}66, transparent)`,
                      opacity: 0,
                      transition: "opacity 0.4s",
                    }}
                    className="step-accent-line"
                  />
                </div>
              </Tilt>
            ))}
          </div>

          <div className="reveal mt-14 text-center">
            <Link
              href="/get-a-website"
              className="inline-flex items-center gap-3 rounded-full px-10 py-4 text-sm font-bold text-white transition-all duration-500 hover:scale-[1.04] hover:brightness-110"
              style={{ background: ACCENT }}
            >
              Start now — it&apos;s free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="px-6 py-32" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-20">
            <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>What's included</p>
            <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: PAPER }}>
              Everything.<br />
              <span style={{ color: "rgba(245,245,247,0.25)" }}>No extras.</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Tilt
                key={f.num}
                className={`reveal${i > 0 ? `-delay-${Math.min(i % 3 + 1, 3)}` : ""}`}
                style={{
                  borderRadius: 18,
                  border: `1px solid ${BORDER}`,
                  background: "rgba(255,255,255,0.02)",
                  cursor: "default",
                }}
              >
                <div className="p-7">
                  <p className="mb-4 text-xs font-bold tracking-[0.35em]" style={{ color: `${ACCENT}66` }}>{f.num}</p>
                  <h3 className="mb-3" style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em", color: PAPER }}>{f.title}</h3>
                  <p style={{ fontSize: "0.88rem", color: MUTED, lineHeight: 1.75 }}>{f.desc}</p>
                </div>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES ─────────────────────────────────────── */}
      <section id="examples" className="overflow-hidden px-6 py-16 lg:py-32" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 lg:mb-20">
            <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>Real clients</p>
            <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: PAPER }}>
              Real websites.<br />
              <span style={{ color: "rgba(245,245,247,0.25)" }}>Real results.</span>
            </h2>
          </div>

          <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
            {caseStudies.map((c, i) => (
              <div key={c.name} className={`reveal${i > 0 ? `-delay-${Math.min(i, 3)}` : ""} flex flex-col gap-6`}>
                {/* Site preview */}
                <Tilt intensity={6} className="w-full" style={{ cursor: "default" }}>
                  <BrowserMockup domain={c.domain} bg={c.bg} accent={c.accent} imageSrc={c.imageSrc} />
                </Tilt>

                {/* Testimonial */}
                <div>
                  <div className="mb-3 flex gap-0.5 text-sm" style={{ color: c.accent }}>★★★★★</div>
                  <p className="mb-4 italic leading-relaxed" style={{ color: "rgba(245,245,247,0.65)", fontSize: "0.95rem" }}>
                    &ldquo;{c.quote}&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: PAPER }}>{c.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(245,245,247,0.3)" }}>{c.type}</p>
                    </div>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold transition-opacity hover:opacity-70"
                      style={{ color: c.accent }}
                    >
                      Visit →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-32" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>Pricing</p>
              <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: PAPER }}>
                Transparent.<br />
                <span style={{ color: "rgba(245,245,247,0.25)" }}>Simple.</span>
              </h2>
              <p className="reveal mt-6 leading-relaxed" style={{ color: MUTED, maxWidth: "46ch" }}>
                We take the financial risk so you don&apos;t have to. The build is completely
                free. If you love it, you just pay for hosting to keep your website active — that&apos;s it.
              </p>

              {/* Comparison */}
              <div className="reveal mt-10 space-y-3">
                {[
                  { label: "Traditional agency", price: "£1,000–£8,000", strikethrough: true },
                  { label: "DIY website builder", price: "Your valuable time", strikethrough: true },
                  { label: "VIV-Z", price: "Free website build", accent: true },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-xl px-5 py-3"
                    style={{
                      background: row.accent ? `${ACCENT}10` : "rgba(255,255,255,0.02)",
                      border: `1px solid ${row.accent ? `${ACCENT}33` : BORDER}`,
                    }}
                  >
                    <span className="text-sm" style={{ color: row.accent ? PAPER : MUTED, textDecoration: row.strikethrough ? "line-through" : "none" }}>
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: row.accent ? ACCENT : "rgba(245,245,247,0.3)", textDecoration: row.strikethrough ? "line-through" : "none" }}>
                      {row.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Tilt
              intensity={4}
              className="reveal"
              style={{
                borderRadius: 24,
                border: `1px solid ${BORDER}`,
                background: "rgba(255,255,255,0.025)",
                cursor: "default",
              }}
            >
              <div className="p-10">
                <div className="mb-6 flex items-center justify-between">
                  <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${ACCENT}18`, color: ACCENT }}>Build price</span>
                  <span className="text-xs" style={{ color: "rgba(245,245,247,0.25)", textDecoration: "line-through" }}>Others charge £500–£5,000</span>
                </div>

                <p style={{ fontSize: "clamp(3.5rem, 7vw, 5.5rem)", fontWeight: 900, letterSpacing: "-0.05em", color: ACCENT, lineHeight: 1 }}>FREE</p>
                <p className="mt-1 mb-7" style={{ color: "rgba(245,245,247,0.3)", fontSize: "0.9rem" }}>to design and build</p>

                <div style={{ height: 1, background: BORDER }} />

                <p
                  className="mt-7 mb-2"
                  style={{
                    fontSize: "clamp(1.15rem, 2.5vw, 1.55rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: PAPER,
                    lineHeight: 1.35,
                    maxWidth: "22ch",
                  }}
                >
                  Just pay for hosting to keep your website active
                </p>
                <p className="mb-8 text-xs" style={{ color: "rgba(245,245,247,0.25)" }}>Hosting · SSL · domain · client booking portal · no hidden fees</p>

                <ul className="mb-8 space-y-3">
                  {[
                    "Custom site built at no cost",
                    "Live preview before you subscribe",
                    "Unlimited revisions until you&apos;re happy",
                    "Global CDN hosting",
                    "SSL certificate included",
                    "Your domain connected",
                    "Client booking portal included — no add-on fee",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "rgba(245,245,247,0.65)" }}>
                      <span style={{ color: ACCENT, flexShrink: 0 }}>✓</span>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>

                <Link
                  href="/get-a-website"
                  className="block w-full rounded-full py-4 text-center text-sm font-bold text-white transition-all duration-500 hover:brightness-110 hover:scale-[1.01]"
                  style={{ background: ACCENT }}
                >
                  Claim your free website →
                </Link>
                <p className="mt-3 text-center text-xs" style={{ color: "rgba(245,245,247,0.2)" }}>
                  Pay for hosting only if you love it
                </p>
              </div>
            </Tilt>
          </div>
        </div>
      </section>

      {/* ── RISK REVERSAL ────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-6 py-36"
        style={{ borderTop: `1px solid ${BORDER}`, background: "#0d0d0f" }}
      >
        {/* Background texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,91,4,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 500,
            background: `radial-gradient(ellipse, ${ACCENT}10 0%, transparent 65%)`,
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="reveal mb-6 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>Our promise</p>
          <h2
            className="reveal"
            style={{ fontSize: "clamp(2.2rem, 7vw, 6rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, color: PAPER }}
          >
            We take the risk
            <br />
            <span style={{ color: "rgba(245,245,247,0.25)" }}>so you don&apos;t have to.</span>
          </h2>
          <p
            className="reveal mx-auto mt-8 leading-relaxed"
            style={{ color: MUTED, fontSize: "clamp(1rem, 1.5vw, 1.2rem)", maxWidth: "54ch" }}
          >
            We build your complete website before asking for anything. If you
            love it — great. If you don&apos;t — you owe us nothing. That&apos;s how
            confident we are in our work.
          </p>
          <div className="reveal mt-12">
            <Link
              href="/get-a-website"
              className="inline-flex items-center gap-3 rounded-full px-10 py-5 text-base font-black text-white transition-all duration-500 hover:scale-[1.04] hover:brightness-110"
              style={{ background: ACCENT }}
            >
              Get started — it&apos;s free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="px-6 py-32" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-20">
            <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>FAQ</p>
            <h2 className="reveal" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: PAPER }}>
              Common<br />
              <span style={{ color: "rgba(245,245,247,0.25)" }}>questions.</span>
            </h2>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}` }}>
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                className={`reveal${i > 0 ? `-delay-${Math.min(i % 3 + 1, 3)}` : ""} group py-8 transition-colors duration-300`}
                style={{ borderBottom: `1px solid ${BORDER}` }}
              >
                <h3 className="mb-3" style={{ fontSize: "1.05rem", fontWeight: 600, letterSpacing: "-0.01em", color: PAPER }}>{faq.q}</h3>
                <p style={{ color: MUTED, lineHeight: 1.8, maxWidth: "70ch", fontSize: "0.93rem" }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-40 text-center" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 500,
            background: `radial-gradient(ellipse, ${ACCENT}12 0%, transparent 70%)`,
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="reveal mb-6 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>Ready?</p>
          <h2
            className="reveal"
            style={{ fontSize: "clamp(2.5rem, 8vw, 7rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.93, color: PAPER }}
          >
            See your new
            <br />
            website tomorrow.
          </h2>
          <p
            className="reveal mx-auto mt-8"
            style={{ color: MUTED, fontSize: "clamp(1rem, 1.5vw, 1.15rem)", maxWidth: "50ch", lineHeight: 1.7 }}
          >
            Fill in your details and we&apos;ll get to work today. Your live preview
            will be ready within 24 hours — no card, no commitment.
          </p>
          <div className="reveal mt-12">
            <Link
              href="/get-a-website"
              className="group inline-flex items-center gap-3 rounded-full px-12 py-5 text-lg font-black text-white transition-all duration-500 hover:scale-[1.04] hover:gap-5 hover:brightness-110"
              style={{ background: ACCENT }}
            >
              Claim your free website
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <p className="reveal mt-5 text-xs" style={{ color: "rgba(245,245,247,0.2)" }}>
            No card required · No contracts · Pay for hosting only if you love it
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="px-6 py-16" style={{ borderTop: `1px solid ${BORDER}`, background: "#060607" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <VivZWordmark size="sm" />
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(245,245,247,0.3)", maxWidth: "34ch" }}>
                Professional websites built for free. Hosting keeps your site active and includes the client booking portal at no extra charge.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "rgba(245,245,247,0.2)" }}>Product</h3>
              <ul className="space-y-2.5 text-sm" style={{ color: "rgba(245,245,247,0.4)" }}>
                <li><Link href="/" className="transition-colors hover:text-[#f5f5f7]">Home</Link></li>
                <li><Link href="/business-management-saas" className="transition-colors hover:text-[#f5f5f7]">CRM</Link></li>
                <li><Link href="/internal-systems" className="transition-colors hover:text-[#f5f5f7]">Ops &amp; AI</Link></li>
                <li><Link href="/marketing-advertising" className="transition-colors hover:text-[#f5f5f7]">Marketing &amp; advertising</Link></li>
                <li><Link href="/contact" className="transition-colors hover:text-[#f5f5f7]">Contact</Link></li>
                <li><Link href="/get-a-website" className="transition-colors hover:text-[#ff5b04]">Get started free</Link></li>
                <li><Link href="/services" className="transition-colors hover:text-[#f5f5f7]">More services</Link></li>
                <li>
                  <Link href="/dashboard" className="inline-flex items-center gap-1.5 transition-colors hover:text-[#f5f5f7]">
                    Login
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5 }}>
                      <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "rgba(245,245,247,0.2)" }}>Company</h3>
              <ul className="space-y-2.5 text-sm" style={{ color: "rgba(245,245,247,0.4)" }}>
                <li><Link href="/contact" className="transition-colors hover:text-[#f5f5f7]">Contact</Link></li>
                <li><Link href="/terms" className="transition-colors hover:text-[#f5f5f7]">Terms &amp; Conditions</Link></li>
                <li><Link href="/privacy" className="transition-colors hover:text-[#f5f5f7]">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div
            className="mt-12 flex flex-col items-center gap-2 pt-8 text-center text-xs sm:flex-row sm:justify-between"
            style={{ borderTop: `1px solid ${BORDER}`, color: "rgba(245,245,247,0.18)" }}
          >
            <p>© {new Date().getFullYear()} VIV-Z. All rights reserved.</p>
            <p>VAT No. 471 2850 92</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
