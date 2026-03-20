"use client";

import { useState, useEffect } from "react";
import { Settings, Check, Eye, EyeOff, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProvider } from "@/components/provider-context";

const CURRENCIES = [
  { code: "usd", label: "USD — US Dollar" },
  { code: "eur", label: "EUR — Euro" },
  { code: "gbp", label: "GBP — British Pound" },
  { code: "cad", label: "CAD — Canadian Dollar" },
  { code: "aud", label: "AUD — Australian Dollar" },
  { code: "nzd", label: "NZD — New Zealand Dollar" },
  { code: "chf", label: "CHF — Swiss Franc" },
  { code: "sek", label: "SEK — Swedish Krona" },
  { code: "nok", label: "NOK — Norwegian Krone" },
  { code: "dkk", label: "DKK — Danish Krone" },
  { code: "jpy", label: "JPY — Japanese Yen" },
  { code: "sgd", label: "SGD — Singapore Dollar" },
  { code: "hkd", label: "HKD — Hong Kong Dollar" },
  { code: "mxn", label: "MXN — Mexican Peso" },
  { code: "brl", label: "BRL — Brazilian Real" },
  { code: "zar", label: "ZAR — South African Rand" },
  { code: "aed", label: "AED — UAE Dirham" },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

const SESSION_DURATIONS = [30, 45, 60, 75, 90, 120];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

interface Provider {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  serviceType?: string | null;
  timezone: string;
  sessionDurationMins: number;
  currency: string;
  stripeConfigured: boolean;
  stripeSecretKeyMasked?: string | null;
  stripeWebhookSecretMasked?: string | null;
}

export default function SettingsPage() {
  const { providerId: PROVIDER_ID } = useProvider();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [sessionDurationMins, setSessionDurationMins] = useState("60");
  const [currency, setCurrency] = useState("usd");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Stripe form
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [stripeSaving, setStripeSaving] = useState(false);
  const [stripeSaved, setStripeSaved] = useState(false);
  const [stripeError, setStripeError] = useState("");

  // Availability
  type DaySlot = { enabled: boolean; startTime: string; endTime: string };
  const [availSlots, setAvailSlots] = useState<DaySlot[]>(
    DAYS.map(() => ({ enabled: false, startTime: DEFAULT_START, endTime: DEFAULT_END }))
  );
  const [availSaving, setAvailSaving] = useState(false);
  const [availSaved, setAvailSaved] = useState(false);
  async function fetchProvider() {
    try {
      const [provRes, availRes] = await Promise.all([
        fetch(`/api/providers?providerId=${PROVIDER_ID}`),
        fetch(`/api/availability?providerId=${PROVIDER_ID}`),
      ]);
      const data = await provRes.json();
      const p: Provider = data.provider;
      setProvider(p);
      setName(p.name);
      setEmail(p.email ?? "");
      setPhone(p.phone ?? "");
      setServiceType(p.serviceType ?? "");
      setTimezone(p.timezone);
      setSessionDurationMins(String(p.sessionDurationMins));
      setCurrency(p.currency ?? "usd");
      const availData = await availRes.json();
      const rows: { dayOfWeek: number; startTime: string; endTime: string }[] = availData.availability ?? [];
      setAvailSlots(DAYS.map((_, i) => {
        const row = rows.find((r) => r.dayOfWeek === i);
        return row
          ? { enabled: true, startTime: row.startTime, endTime: row.endTime }
          : { enabled: false, startTime: DEFAULT_START, endTime: DEFAULT_END };
      }));
    } catch {
      setError("Failed to load provider settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (PROVIDER_ID) fetchProvider();
  }, [PROVIDER_ID]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      const res = await fetch(`/api/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, serviceType, timezone, sessionDurationMins, currency }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleStripeSave(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setStripeSaving(true);
    setStripeError("");
    setStripeSaved(false);
    try {
      const res = await fetch(`/api/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeSecretKey: stripeSecretKey || undefined,
          stripeWebhookSecret: stripeWebhookSecret || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setStripeSaved(true);
      setStripeSecretKey("");
      setStripeWebhookSecret("");
      setTimeout(() => setStripeSaved(false), 3000);
      await fetchProvider(); // refresh masked key display
    } catch (err) {
      setStripeError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setStripeSaving(false);
    }
  }

  async function handleStripeDisconnect() {
    if (!provider) return;
    if (!confirm("Remove Stripe credentials? Checkout links will stop working.")) return;
    setStripeSaving(true);
    try {
      await fetch(`/api/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeSecretKey: "", stripeWebhookSecret: "" }),
      });
      await fetchProvider();
    } finally {
      setStripeSaving(false);
    }
  }

  async function handleAvailabilitySave(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setAvailSaving(true);
    setAvailSaved(false);
    setError("");
    try {
      const slots = availSlots
        .map((s, i) => ({ ...s, dayOfWeek: i }))
        .filter((s) => s.enabled)
        .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }));
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: provider.id, slots }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save availability");
      }
      setAvailSaved(true);
      setTimeout(() => setAvailSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save availability");
    } finally {
      setAvailSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500 py-8 text-center">Loading settings…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure your provider profile and integrations</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">{error}</div>
      )}

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4 text-gray-500" />
            Provider Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="settingName">Display Name *</Label>
                <Input
                  id="settingName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name or business name"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="settingServiceType">Service Type</Label>
                <Input
                  id="settingServiceType"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g. Personal Trainer, Therapist"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="settingEmail">Email</Label>
                <Input
                  id="settingEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="settingPhone">Phone</Label>
                <Input
                  id="settingPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <hr className="border-gray-100" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Default Session Duration</Label>
                <Select value={sessionDurationMins} onValueChange={setSessionDurationMins}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SESSION_DURATIONS.map((d) => (
                      <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={profileSaving || !provider}>
                {profileSaving ? "Saving…" : "Save Profile"}
              </Button>
              {profileSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <Check className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stripe */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Stripe</CardTitle>
            <div className="flex items-center gap-2">
              {provider?.stripeConfigured ? (
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Connected
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                  Not connected
                </span>
              )}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                Stripe Dashboard <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {provider?.stripeConfigured && (
            <div className="mb-4 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm space-y-1">
              <div className="flex justify-between text-gray-700">
                <span className="text-gray-500">Secret key</span>
                <code className="font-mono">{provider.stripeSecretKeyMasked}</code>
              </div>
              {provider.stripeWebhookSecretMasked && (
                <div className="flex justify-between text-gray-700">
                  <span className="text-gray-500">Webhook secret</span>
                  <code className="font-mono">{provider.stripeWebhookSecretMasked}</code>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleStripeSave} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="stripeSecretKey">
                {provider?.stripeConfigured ? "Replace Secret Key" : "Secret Key"}
              </Label>
              <div className="relative">
                <Input
                  id="stripeSecretKey"
                  type={showSecretKey ? "text" : "password"}
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  placeholder="sk_live_… or sk_test_…"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Found in Stripe Dashboard → Developers → API keys. Use a restricted key with Products, Prices, and Checkout Sessions write access.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="stripeWebhookSecret">
                {provider?.stripeWebhookSecretMasked ? "Replace Webhook Secret" : "Webhook Secret"}{" "}
                <span className="text-gray-400">(optional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="stripeWebhookSecret"
                  type={showWebhookSecret ? "text" : "password"}
                  value={stripeWebhookSecret}
                  onChange={(e) => setStripeWebhookSecret(e.target.value)}
                  placeholder="whsec_…"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Required to verify Stripe webhook events. Set your webhook endpoint to{" "}
                <code className="bg-gray-100 px-1 rounded text-xs">
                  {process.env.NEXT_PUBLIC_APP_URL ?? "https://yourapp.com"}/api/stripe/webhook
                </code>
              </p>
            </div>

            {stripeError && <p className="text-sm text-red-600">{stripeError}</p>}

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={stripeSaving || (!stripeSecretKey && !stripeWebhookSecret)}
              >
                {stripeSaving ? "Saving…" : provider?.stripeConfigured ? "Update Keys" : "Connect Stripe"}
              </Button>
              {stripeSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <Check className="h-4 w-4" /> Saved
                </span>
              )}
              {provider?.stripeConfigured && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStripeDisconnect}
                  disabled={stripeSaving}
                  className="ml-auto text-red-600 border-red-200 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-gray-500" />
            Weekly Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAvailabilitySave} className="space-y-3">
            {DAYS.map((day, i) => (
              <div key={day} className="flex items-center gap-3">
                <label className="flex items-center gap-2 w-12 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availSlots[i].enabled}
                    onChange={(e) =>
                      setAvailSlots((prev) =>
                        prev.map((s, j) => j === i ? { ...s, enabled: e.target.checked } : s)
                      )
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
                {availSlots[i].enabled ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={availSlots[i].startTime}
                      onChange={(e) =>
                        setAvailSlots((prev) =>
                          prev.map((s, j) => j === i ? { ...s, startTime: e.target.value } : s)
                        )
                      }
                      className="w-32 text-sm"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <Input
                      type="time"
                      value={availSlots[i].endTime}
                      onChange={(e) =>
                        setAvailSlots((prev) =>
                          prev.map((s, j) => j === i ? { ...s, endTime: e.target.value } : s)
                        )
                      }
                      className="w-32 text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Unavailable</span>
                )}
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={availSaving}>
                {availSaving ? "Saving…" : "Save Availability"}
              </Button>
              {availSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <Check className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
