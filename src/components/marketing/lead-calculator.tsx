"use client";

import { useState } from "react";

type SessionsPerWeek = "1-5" | "6-10" | "11-20" | "20+";
type RatePerSession = "under30" | "30-50" | "50-75" | "75-100" | "over100";
type CurrentChannel = "wordOfMouth" | "social" | "website" | "onlineBooking" | "google";
type BusinessType = "PT" | "massage" | "physio" | "nutritionist" | "yoga" | "other";

interface FormData {
  sessionsPerWeek: SessionsPerWeek | null;
  ratePerSession: RatePerSession | null;
  currentChannels: CurrentChannel[];
  name: string;
  email: string;
  phone: string;
  businessType: BusinessType | null;
}

const SESSION_MAP: Record<SessionsPerWeek, number> = {
  "1-5": 3,
  "6-10": 8,
  "11-20": 15,
  "20+": 22,
};

const RATE_MAP: Record<RatePerSession, number> = {
  "under30": 25,
  "30-50": 40,
  "50-75": 62,
  "75-100": 87,
  "over100": 120,
};

const RATE_LABELS: Record<RatePerSession, string> = {
  "under30": "Under £30",
  "30-50": "£30 – £50",
  "50-75": "£50 – £75",
  "75-100": "£75 – £100",
  "over100": "Over £100",
};

const BUSINESS_LABELS: Record<BusinessType, string> = {
  PT: "Personal Trainer",
  massage: "Massage Therapist",
  physio: "Physiotherapist",
  nutritionist: "Nutritionist / Dietitian",
  yoga: "Yoga / Pilates Instructor",
  other: "Other",
};

function calcResults(data: FormData) {
  const sessions = SESSION_MAP[data.sessionsPerWeek!];
  const rate = RATE_MAP[data.ratePerSession!];
  const currentMonthly = Math.round(sessions * rate * 4.3);

  // Every missing channel adds to the uplift
  const hasWebsite = data.currentChannels.includes("website");
  const hasGoogle = data.currentChannels.includes("google");
  const hasBooking = data.currentChannels.includes("onlineBooking");
  const hasSocial = data.currentChannels.includes("social");

  let upliftPct = 0;
  if (!hasWebsite) upliftPct += 35;
  if (!hasGoogle) upliftPct += 30;
  if (!hasBooking) upliftPct += 20;
  if (!hasSocial) upliftPct += 15;

  // Floor at 25% even if they have everything
  upliftPct = Math.max(upliftPct, 25);

  const potentialMonthly = Math.round(currentMonthly * (1 + upliftPct / 100));
  const extraMonthly = potentialMonthly - currentMonthly;

  // Admin hours saved
  let adminHours = 0;
  if (!hasBooking) adminHours += 6;
  if (!hasWebsite) adminHours += 3;
  if (data.currentChannels.includes("wordOfMouth") && data.currentChannels.length <= 2) adminHours += 4;
  adminHours = Math.max(adminHours, 5);

  // Leads lost estimate (enquiries that go cold without fast follow-up)
  const leadsLost = !hasBooking || data.currentChannels.length <= 2 ? Math.round(sessions * 0.4) : Math.round(sessions * 0.2);
  const leadsLostValue = leadsLost * rate * 4; // avg 4 sessions per new client

  return { currentMonthly, potentialMonthly, extraMonthly, adminHours, leadsLost, leadsLostValue, upliftPct };
}

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB")}`;
}

export function LeadCalculator() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<FormData>({
    sessionsPerWeek: null,
    ratePerSession: null,
    currentChannels: [],
    name: "",
    email: "",
    phone: "",
    businessType: null,
  });

  const results = data.sessionsPerWeek && data.ratePerSession ? calcResults(data) : null;

  function toggleChannel(ch: CurrentChannel) {
    setData((d) => ({
      ...d,
      currentChannels: d.currentChannels.includes(ch)
        ? d.currentChannels.filter((c) => c !== ch)
        : [...d.currentChannels, ch],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.name || !data.email) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, results }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong — please email us directly at hello@viv-z.com");
    } finally {
      setSubmitting(false);
    }
  }

  const totalSteps = 3;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-semibold text-emerald-400">
          Free Revenue Calculator
        </span>
        <h2 className="mb-3 text-3xl font-black text-white md:text-4xl">
          How much are you leaving on the table?
        </h2>
        <p className="text-gray-400">
          Answer 3 quick questions and we&apos;ll show you your growth potential.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        {/* Progress bar */}
        {!submitted && (
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-xs text-gray-500">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% complete</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <h3 className="mb-2 text-lg font-bold text-white">How many sessions do you deliver per week?</h3>
            <p className="mb-6 text-sm text-gray-400">Include 1-to-1, pairs, and group sessions.</p>
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["1-5", "6-10", "11-20", "20+"] as SessionsPerWeek[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setData((d) => ({ ...d, sessionsPerWeek: v }))}
                  className={`rounded-xl border py-4 text-center font-bold transition ${
                    data.sessionsPerWeek === v
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-emerald-500/50 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <h3 className="mb-2 text-lg font-bold text-white">What do you charge per session?</h3>
            <p className="mb-6 text-sm text-gray-400">Your average 1-to-1 or group session rate.</p>
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(Object.entries(RATE_LABELS) as [RatePerSession, string][]).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setData((d) => ({ ...d, ratePerSession: v }))}
                  className={`rounded-xl border py-4 text-center font-bold transition ${
                    data.ratePerSession === v
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-emerald-500/50 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!data.sessionsPerWeek || !data.ratePerSession}
              className="w-full rounded-xl bg-emerald-500 py-4 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <h3 className="mb-2 text-lg font-bold text-white">How do clients currently find and book you?</h3>
            <p className="mb-6 text-sm text-gray-400">Select all that apply.</p>
            <div className="mb-8 space-y-3">
              {([
                ["wordOfMouth", "Word of mouth / referrals only"],
                ["social", "Instagram / Facebook"],
                ["website", "I have a website"],
                ["onlineBooking", "I have an online booking system"],
                ["google", "Google / Google Business Profile"],
              ] as [CurrentChannel, string][]).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => toggleChannel(v)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-5 py-4 text-left transition ${
                    data.currentChannels.includes(v)
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-emerald-500/50 hover:text-white"
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold transition ${
                    data.currentChannels.includes(v)
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-white/20 text-transparent"
                  }`}>✓</span>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-xl border border-white/10 px-6 py-4 font-semibold text-gray-400 transition hover:border-white/20 hover:text-white"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-xl bg-emerald-500 py-4 font-bold text-white transition hover:bg-emerald-400"
              >
                See my results →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Results + Lead Capture ── */}
        {step === 3 && !submitted && results && (
          <div>
            {/* Results panel */}
            <div className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-950/50 p-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                Your growth snapshot
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-white/5 p-4 text-center">
                  <p className="mb-1 text-2xl font-black text-white">{fmt(results.currentMonthly)}</p>
                  <p className="text-xs text-gray-400">Current est. monthly revenue</p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-4 text-center ring-1 ring-emerald-500/30">
                  <p className="mb-1 text-2xl font-black text-emerald-400">{fmt(results.potentialMonthly)}</p>
                  <p className="text-xs text-emerald-300">Potential monthly revenue</p>
                </div>
                <div className="rounded-lg bg-white/5 p-4 text-center">
                  <p className="mb-1 text-2xl font-black text-white">{results.adminHours}+ hrs</p>
                  <p className="text-xs text-gray-400">Admin hours saved / month</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
                <strong>Extra revenue opportunity: {fmt(results.extraMonthly)}/month</strong> — based on an estimated {results.upliftPct}% uplift from filling the gaps in your current setup.
              </div>
            </div>

            {/* Lead capture */}
            <p className="mb-1 text-base font-bold text-white">Get your free personalised growth plan</p>
            <p className="mb-5 text-sm text-gray-400">
              We&apos;ll review your numbers and send you a tailored breakdown — no obligation.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="Your name"
                  value={data.name}
                  onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={data.email}
                  onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={data.phone}
                  onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                />
                <select
                  value={data.businessType ?? ""}
                  onChange={(e) => setData((d) => ({ ...d, businessType: e.target.value as BusinessType }))}
                  className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="" disabled>What do you do?</option>
                  {(Object.entries(BUSINESS_LABELS) as [BusinessType, string][]).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-400 transition hover:text-white"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !data.name || !data.email}
                  className="flex-1 rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send me my growth plan →"}
                </button>
              </div>
              <p className="text-center text-xs text-gray-600">No spam. No pressure. Just useful numbers.</p>
            </form>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {submitted && (
          <div className="py-8 text-center">
            <div className="mb-4 text-5xl">🎉</div>
            <h3 className="mb-2 text-xl font-black text-white">Thanks, {data.name.split(" ")[0]}!</h3>
            <p className="text-gray-400">
              We&apos;ve received your details and will send your personalised growth plan within 24 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
