"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VivZWordmark } from "@/components/marketing/logo";

const businessTypes = [
  "Personal Trainer", "Fitness Coach", "Yoga Instructor", "Pilates Instructor",
  "Nutritionist / Dietitian", "Life Coach", "Business Coach", "Therapist / Counsellor",
  "Massage Therapist", "Beauty Therapist", "Hair Stylist", "Photographer",
  "Freelance Designer", "Accountant", "Solicitor", "Other",
];

const websiteStyles = [
  { value: "clean_minimal", label: "Clean & Minimal", desc: "Simple, elegant, lots of white space" },
  { value: "bold_modern", label: "Bold & Modern", desc: "Strong typography, vivid colours, impactful" },
  { value: "cinematic_3d", label: "Cinematic 3D", desc: "Immersive animations, premium feel" },
];

// ── shared styles ──────────────────────────────────────────────
const inputBase =
  "w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5b04] transition-all duration-300 placeholder:text-[rgba(245,245,247,0.25)]";

const inputSt: React.CSSProperties = {
  background: "#111113",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#f5f5f7",
};

const sectionSt: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.02)",
};

const labelSt: React.CSSProperties = { color: "rgba(245,245,247,0.7)" };
const headingSt: React.CSSProperties = { color: "rgba(245,245,247,0.3)" };

// ── component ─────────────────────────────────────────────────
export default function GetAWebsitePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // logo
  const [logoInputMethod, setLogoInputMethod] = useState<"url" | "upload">("url");
  const [logoFileName, setLogoFileName] = useState("");

  // reviews
  const [reviewsMethod, setReviewsMethod] = useState<"none" | "paste" | "link">("none");

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    businessName: "", businessType: "",
    brandColours: "", description: "",
    hasLogo: false, logoUrl: "", logoFileData: "",
    preferredStyle: "clean_minimal",
    reviewsText: "", reviewsLink: "",
    referralSource: "",
  });

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => set("logoFileData", reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        reviewsMethod,
        logoInputMethod,
      };
      const res = await fetch("/api/website-service/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong");
      }
      router.push("/get-a-website/success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0b", color: "#f5f5f7" }}>
      {/* NAV */}
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-xl"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,10,11,0.88)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="VIV-Z Home" className="opacity-90 hover:opacity-100 transition-opacity duration-300">
            <VivZWordmark size="sm" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-20">
        {/* Header */}
        <div className="mb-14 text-center">
          <span
            className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em]"
            style={{ background: "rgba(255,91,4,0.15)", color: "#ff5b04" }}
          >
            Free website build — £24/month hosting
          </span>
          <h1
            className="mt-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#f5f5f7" }}
          >
            Get your professional
            <br />website
          </h1>
          <p className="mt-4 leading-relaxed" style={{ color: "rgba(245,245,247,0.45)", fontSize: "1.05rem" }}>
            Fill in your details and we&apos;ll build your website. You&apos;ll receive a
            live preview within 24 hours — no card required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── YOUR DETAILS ─────────────────────────────── */}
          <section className="space-y-4 rounded-2xl p-7" style={sectionSt}>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]" style={headingSt}>Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium" style={labelSt}>Full name *</span>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                  className={inputBase} style={inputSt} placeholder="Jane Smith" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium" style={labelSt}>Email *</span>
                <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  className={inputBase} style={inputSt} placeholder="jane@example.com" />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium" style={labelSt}>Phone (optional)</span>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                className={inputBase} style={inputSt} placeholder="+44 7700 000000" />
            </label>
          </section>

          {/* ── YOUR BUSINESS ────────────────────────────── */}
          <section className="space-y-4 rounded-2xl p-7" style={sectionSt}>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]" style={headingSt}>Your business</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium" style={labelSt}>Business name *</span>
                <input required value={form.businessName} onChange={(e) => set("businessName", e.target.value)}
                  className={inputBase} style={inputSt} placeholder="Jane's Fitness" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium" style={labelSt}>Business type *</span>
                <select
                  required
                  value={form.businessType}
                  onChange={(e) => set("businessType", e.target.value)}
                  className={`${inputBase} dark-select`}
                  style={{ ...inputSt, cursor: "pointer" }}
                >
                  <option value="" style={{ background: "#111113", color: "#f5f5f7" }}>Select…</option>
                  {businessTypes.map((t) => (
                    <option key={t} value={t} style={{ background: "#111113", color: "#f5f5f7" }}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium" style={labelSt}>Brand colours *</span>
              <input required placeholder="e.g. navy blue, gold, and white" value={form.brandColours}
                onChange={(e) => set("brandColours", e.target.value)}
                className={inputBase} style={inputSt} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium" style={labelSt}>
                Describe your business and what makes you different *
              </span>
              <textarea required rows={4} value={form.description}
                placeholder="e.g. Family-run plumbing business serving Manchester since 2005. We specialise in boiler installations and emergency call-outs…"
                onChange={(e) => set("description", e.target.value)}
                className={inputBase} style={{ ...inputSt, resize: "vertical" }} />
            </label>
          </section>

          {/* ── LOGO ─────────────────────────────────────── */}
          <section className="space-y-4 rounded-2xl p-7" style={sectionSt}>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]" style={headingSt}>Logo</h2>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={form.hasLogo}
                onChange={(e) => set("hasLogo", e.target.checked)}
                className="h-4 w-4 rounded" style={{ accentColor: "#ff5b04" }} />
              <span className="text-sm" style={labelSt}>I have a logo</span>
            </label>

            {form.hasLogo && (
              <div className="space-y-4">
                {/* Method toggle */}
                <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  {(["url", "upload"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setLogoInputMethod(m)}
                      className="flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300"
                      style={{
                        background: logoInputMethod === m ? "#ff5b04" : "transparent",
                        color: logoInputMethod === m ? "#fff" : "rgba(245,245,247,0.4)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {m === "url" ? "Paste a link" : "Upload file"}
                    </button>
                  ))}
                </div>

                {logoInputMethod === "url" ? (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium" style={labelSt}>
                      Google Drive, Dropbox, or direct link
                    </span>
                    <input value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)}
                      placeholder="https://drive.google.com/…"
                      className={inputBase} style={inputSt} />
                  </label>
                ) : (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*,.svg,.pdf,.ai,.eps"
                      onChange={handleLogoFile} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full rounded-xl py-8 text-sm font-medium transition-all duration-300 hover:border-[#ff5b04]/50"
                      style={{
                        border: "2px dashed rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.02)",
                        color: "rgba(245,245,247,0.5)",
                        cursor: "pointer",
                      }}
                    >
                      {logoFileName ? (
                        <span style={{ color: "#ff5b04" }}>✓ {logoFileName}</span>
                      ) : (
                        <>
                          <span style={{ display: "block", fontSize: "1.5rem", marginBottom: 6 }}>↑</span>
                          Click to upload your logo
                          <span style={{ display: "block", fontSize: "0.75rem", marginTop: 4, color: "rgba(245,245,247,0.3)" }}>
                            PNG, SVG, PDF, AI — any format works
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── REVIEWS ──────────────────────────────────── */}
          <section className="space-y-4 rounded-2xl p-7" style={sectionSt}>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em]" style={headingSt}>Reviews (optional)</h2>
              <p className="mt-1 text-xs" style={{ color: "rgba(245,245,247,0.3)" }}>
                We&apos;ll display your best reviews on your website to build trust with new visitors.
              </p>
            </div>

            {/* Method chooser */}
            <div className="space-y-2">
              {(["none", "paste", "link"] as const).map((m) => (
                <label
                  key={m}
                  className="flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 transition-all duration-300"
                  style={{
                    border: reviewsMethod === m ? "1px solid #ff5b04" : "1px solid rgba(255,255,255,0.08)",
                    background: reviewsMethod === m ? "rgba(255,91,4,0.07)" : "rgba(255,255,255,0.02)",
                  }}
                >
                  <input type="radio" name="reviewsMethod" checked={reviewsMethod === m}
                    onChange={() => setReviewsMethod(m)} className="mt-0.5"
                    style={{ accentColor: "#ff5b04" }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: reviewsMethod === m ? "#ff5b04" : "#f5f5f7" }}>
                      {m === "none" && "I don't have reviews yet"}
                      {m === "paste" && "I'll paste my reviews"}
                      {m === "link" && "I have a link to my reviews"}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "rgba(245,245,247,0.35)" }}>
                      {m === "none" && "No problem — we'll design the site without them"}
                      {m === "paste" && "Copy and paste reviews from Google, Facebook, etc."}
                      {m === "link" && "Google Business, Trustpilot, Facebook page, etc."}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {reviewsMethod === "paste" && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium" style={labelSt}>
                  Paste your reviews below
                </span>
                <textarea rows={6} value={form.reviewsText}
                  placeholder={'★★★★★ "Best personal trainer I\'ve ever had. Highly recommend!" — Sarah M.\n\n★★★★★ "Changed my life in just 3 months." — John D.'}
                  onChange={(e) => set("reviewsText", e.target.value)}
                  className={inputBase} style={{ ...inputSt, resize: "vertical" }} />
                <p className="mt-1.5 text-xs" style={{ color: "rgba(245,245,247,0.25)" }}>
                  Include the reviewer&apos;s name and star rating if possible.
                </p>
              </label>
            )}

            {reviewsMethod === "link" && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium" style={labelSt}>
                  Link to your reviews page
                </span>
                <input type="url" value={form.reviewsLink}
                  onChange={(e) => set("reviewsLink", e.target.value)}
                  placeholder="https://g.page/your-business or https://www.trustpilot.com/review/…"
                  className={inputBase} style={inputSt} />
                <p className="mt-1.5 text-xs" style={{ color: "rgba(245,245,247,0.25)" }}>
                  Google Business, Trustpilot, Facebook, or any reviews page.
                </p>
              </label>
            )}
          </section>

          {/* ── WEBSITE STYLE ────────────────────────────── */}
          <section className="space-y-4 rounded-2xl p-7" style={sectionSt}>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]" style={headingSt}>Website style</h2>
            <div className="space-y-2">
              {websiteStyles.map((s) => {
                const selected = form.preferredStyle === s.value;
                return (
                  <label
                    key={s.value}
                    className="flex cursor-pointer items-start gap-4 rounded-xl p-4 transition-all duration-300"
                    style={{
                      border: selected ? "1px solid #ff5b04" : "1px solid rgba(255,255,255,0.08)",
                      background: selected ? "rgba(255,91,4,0.08)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <input type="radio" name="style" value={s.value} checked={selected}
                      onChange={() => set("preferredStyle", s.value)} className="mt-0.5"
                      style={{ accentColor: "#ff5b04" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: selected ? "#ff5b04" : "#f5f5f7" }}>{s.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(245,245,247,0.4)" }}>{s.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* ── REFERRAL ─────────────────────────────────── */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium" style={{ color: "rgba(245,245,247,0.5)" }}>
              How did you hear about us? (optional)
            </span>
            <input value={form.referralSource} onChange={(e) => set("referralSource", e.target.value)}
              placeholder="Google, Instagram, a friend…"
              className={inputBase} style={inputSt} />
          </label>

          {/* ── ERROR ────────────────────────────────────── */}
          {error && (
            <div className="rounded-xl px-5 py-4 text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
              {error}
            </div>
          )}

          {/* ── SUBMIT ───────────────────────────────────── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-4 text-sm font-bold text-white transition-all duration-500 hover:scale-[1.02] hover:brightness-110 disabled:opacity-50 disabled:scale-100"
            style={{ background: "#ff5b04" }}
          >
            {loading ? "Submitting…" : "Get my free website →"}
          </button>

          <p className="text-center text-xs" style={{ color: "rgba(245,245,247,0.25)" }}>
            No card required · You&apos;ll see your website before paying anything
          </p>
        </form>
      </main>
    </div>
  );
}
