"use client";

import { useState } from "react";
import Link from "next/link";

function fmt(n: number) {
  return `£${Math.round(n).toLocaleString("en-GB")}`;
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  hint?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-semibold text-gray-200">{label}</label>
        <span className="text-lg font-black text-emerald-400">{display}</span>
      </div>
      {hint && <p className="mb-3 text-xs text-gray-500">{hint}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="calc-slider"
        style={{
          background: `linear-gradient(to right, #10b981 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
        }}
      />
      <div className="mt-1 flex justify-between text-xs text-gray-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
  negative,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 text-center ${
        highlight
          ? "border border-emerald-500/40 bg-emerald-950/60 ring-1 ring-emerald-500/20"
          : negative
            ? "border border-red-500/20 bg-red-950/30"
            : "border border-white/10 bg-white/5"
      }`}
    >
      <p
        className={`mb-1 text-2xl font-black ${
          highlight ? "text-emerald-400" : negative ? "text-red-400" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="text-xs font-semibold text-gray-400">{label}</p>
      {sub && <p className="mt-1 text-xs text-gray-600">{sub}</p>}
    </div>
  );
}

export function RevenueCalculator() {
  const [capacity, setCapacity] = useState(15);
  const [fillRate, setFillRate] = useState(60);
  const [price, setPrice] = useState(60);
  const [adminHours, setAdminHours] = useState(8);

  const WEEKS_PER_MONTH = 4.33;
  const TARGET_FILL = 85;

  const currentSessions = capacity * (fillRate / 100);
  const targetSessions = capacity * (TARGET_FILL / 100);

  const currentMonthly = currentSessions * price * WEEKS_PER_MONTH;
  const targetMonthly = targetSessions * price * WEEKS_PER_MONTH;
  const revenueGap = targetMonthly - currentMonthly;

  const adminCostMonthly = adminHours * WEEKS_PER_MONTH * price;

  const totalLeakageMonthly = revenueGap + adminCostMonthly;
  const totalLeakageAnnual = totalLeakageMonthly * 12;

  const vivzCost = 79;
  const netGainMonthly = Math.max(revenueGap - vivzCost, 0);
  const netGainAnnual = netGainMonthly * 12;

  const currentBarPct = Math.min(Math.round((currentMonthly / targetMonthly) * 100), 100);

  return (
    <section id="calculator" className="bg-gray-950 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-semibold text-emerald-400">
            Revenue Calculator
          </span>
          <h2 className="mb-3 text-3xl font-black text-white md:text-4xl">
            How much is your schedule costing you?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Adjust the sliders to match your situation and see exactly what empty slots and admin time are costing you every month.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-base font-bold uppercase tracking-wider text-gray-400">Your numbers</h3>

            <SliderInput
              label="Available sessions per week"
              value={capacity}
              min={5}
              max={40}
              step={1}
              onChange={setCapacity}
              display={`${capacity} slots`}
              hint="All the time slots you have available to fill with clients"
            />
            <SliderInput
              label="Current fill rate"
              value={fillRate}
              min={20}
              max={100}
              step={5}
              onChange={setFillRate}
              display={`${fillRate}%`}
              hint="What percentage of your slots are currently booked?"
            />
            <SliderInput
              label="Average session price"
              value={price}
              min={25}
              max={200}
              step={5}
              onChange={setPrice}
              display={`£${price}`}
              hint="Your typical 1-to-1 or group session rate"
            />
            <SliderInput
              label="Admin hours per week"
              value={adminHours}
              min={1}
              max={25}
              step={1}
              onChange={setAdminHours}
              display={`${adminHours} hrs`}
              hint="Time on chasing bookings, DMs, reminders, social, invoicing…"
            />
          </div>

          {/* Results */}
          <div className="flex flex-col gap-6">
            {/* Revenue bar */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Monthly revenue snapshot
              </p>
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-gray-300">Current ({fillRate}% full)</span>
                  <span className="font-bold text-white">{fmt(currentMonthly)}/mo</span>
                </div>
                <div className="h-5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white/40 transition-all duration-500"
                    style={{ width: `${currentBarPct}%` }}
                  />
                </div>
              </div>
              <div className="mb-2">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-emerald-300">Optimised ({TARGET_FILL}% full)</span>
                  <span className="font-bold text-emerald-400">{fmt(targetMonthly)}/mo</span>
                </div>
                <div className="h-5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-full rounded-full bg-emerald-500 transition-all duration-500" />
                </div>
              </div>
              <p className="mt-3 text-right text-xs text-gray-600">
                85% fill is a realistic target with automated bookings
              </p>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Empty slots cost / month"
                value={fmt(revenueGap)}
                sub={`${Math.round(capacity * ((TARGET_FILL - fillRate) / 100) * WEEKS_PER_MONTH)} sessions left unfilled`}
                negative
              />
              <MetricCard
                label="Admin time value / month"
                value={fmt(adminCostMonthly)}
                sub={`${Math.round(adminHours * WEEKS_PER_MONTH)} hrs at £${price}/hr`}
                negative
              />
            </div>

            {/* Total leakage */}
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/60 to-gray-950 p-6 text-center">
              <p className="mb-1 text-sm font-semibold text-red-300">
                Total monthly leakage without systems
              </p>
              <p className="mb-0.5 text-5xl font-black text-white">{fmt(totalLeakageMonthly)}</p>
              <p className="text-sm text-red-400">
                That&apos;s{" "}
                <strong className="text-red-300">{fmt(totalLeakageAnnual)} per year</strong>{" "}
                staying on the table
              </p>
            </div>

            {/* VIV-Z recovery */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/70 to-gray-950 p-6 text-center">
              <p className="mb-1 text-sm font-semibold text-emerald-300">
                With VIV-Z (£79/mo) you recover
              </p>
              <p className="mb-0.5 text-5xl font-black text-emerald-400">{fmt(netGainMonthly)}</p>
              <p className="text-sm text-emerald-300">
                extra every month ·{" "}
                <strong>{fmt(netGainAnnual)} per year</strong>
              </p>
              <p className="mt-3 text-xs text-gray-500">
                Based on recovering empty slots only — admin time savings are on top
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 px-8 py-8 text-center">
          <p className="mb-2 text-xl font-black text-white">
            Stop leaving {fmt(totalLeakageMonthly)} on the table every month.
          </p>
          <p className="mb-6 text-gray-400">
            VIV-Z automates your bookings, follow-ups, and marketing so your schedule fills itself.
          </p>
          <Link
            href="mailto:hello@viv-z.com"
            className="inline-block rounded-xl bg-emerald-500 px-8 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-400"
          >
            Get your system set up — £79/mo →
          </Link>
          <p className="mt-3 text-xs text-gray-600">No setup fee · No long contract · Live in 3–5 days</p>
        </div>
      </div>
    </section>
  );
}
