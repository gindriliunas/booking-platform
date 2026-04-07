"use client";

import { useState, useId } from "react";
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
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-gray-200">
          {label}
        </label>
        <span className="text-lg font-black text-emerald-400">{display}</span>
      </div>
      {hint && <p className="mb-3 text-xs text-gray-500">{hint}</p>}
      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-input w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-emerald-500"
          style={{ height: "6px" }}
        />
        {/* filled track overlay */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-[6px] rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%`, marginTop: "0px" }}
        />
      </div>
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

  // ── Core maths ──
  const WEEKS_PER_MONTH = 4.33;
  const TARGET_FILL = 85; // realistic optimised fill rate

  const currentSessions = capacity * (fillRate / 100);
  const targetSessions = capacity * (TARGET_FILL / 100);

  const currentMonthly = currentSessions * price * WEEKS_PER_MONTH;
  const targetMonthly = targetSessions * price * WEEKS_PER_MONTH;
  const revenueGap = targetMonthly - currentMonthly;

  // Value of admin hours (if spent coaching instead)
  const sessionDurationHrs = 1; // assume 1-hour sessions
  const hourlyRate = price / sessionDurationHrs;
  const adminCostMonthly = adminHours * WEEKS_PER_MONTH * hourlyRate;

  // Total leakage per month and year
  const totalLeakageMonthly = revenueGap + adminCostMonthly;
  const totalLeakageAnnual = totalLeakageMonthly * 12;

  // VIV-Z ROI
  const vivzCost = 79;
  const netGainMonthly = revenueGap - vivzCost;
  const netGainAnnual = netGainMonthly * 12;

  // Bar widths (as % of target)
  const currentBarPct = Math.round((currentMonthly / targetMonthly) * 100);

  return (
    <section id="calculator" className="bg-gray-950 px-6 py-20">
      {/* Scoped slider styles */}
      <style>{`
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #fff;
          cursor: pointer;
          box-shadow: 0 0 6px rgba(16,185,129,0.5);
          position: relative;
          z-index: 2;
        }
        .slider-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #fff;
          cursor: pointer;
          box-shadow: 0 0 6px rgba(16,185,129,0.5);
        }
        .slider-input::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 3px;
          background: transparent;
        }
      `}</style>

      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-semibold text-emerald-400">
            Revenue Calculator
          </span>
          <h2 className="mb-3 text-3xl font-black text-white md:text-4xl">
            How much is your schedule costing you?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Adjust the sliders to match your current situation and see exactly what empty slots and admin time are costing your business — every single month.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* ── LEFT: Inputs ── */}
          <div className="space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-base font-bold uppercase tracking-wider text-gray-400">
              Your numbers
            </h3>

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
              hint="Time spent on chasing bookings, DMs, reminders, social, invoicing…"
            />
          </div>

          {/* ── RIGHT: Results ── */}
          <div className="flex flex-col gap-6">
            {/* Revenue bar */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Monthly revenue snapshot
              </p>

              {/* Current */}
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-gray-300">Current ({fillRate}% full)</span>
                  <span className="font-bold text-white">{fmt(currentMonthly)}/mo</span>
                </div>
                <div className="h-5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white/40 transition-all duration-500"
                    style={{ width: `${Math.min(currentBarPct, 100)}%` }}
                  />
                </div>
              </div>

              {/* Target */}
              <div className="mb-2">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-emerald-300">Optimised ({TARGET_FILL}% full)</span>
                  <span className="font-bold text-emerald-400">{fmt(targetMonthly)}/mo</span>
                </div>
                <div className="h-5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <p className="mt-3 text-right text-xs text-gray-600">
                85% fill rate is a realistic target with an automated booking system
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

            {/* Big leakage number */}
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
              <p className="mb-0.5 text-5xl font-black text-emerald-400">
                {fmt(Math.max(netGainMonthly, 0))}
              </p>
              <p className="text-sm text-emerald-300">
                extra every month ·{" "}
                <strong>{fmt(Math.max(netGainAnnual, 0))} per year</strong>
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
