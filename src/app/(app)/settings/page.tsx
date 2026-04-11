"use client";

import { useState, useEffect } from "react";
import { Settings, Check, Eye, EyeOff, ExternalLink, Clock, FileText, Copy, Link2, Calendar } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  allowIndividualSelfBook: boolean;
  allowGroupSelfBook: boolean;
  enableWaitlist: boolean;
  lateCancelWindowHours?: number | null;
  lateCancelAction?: string | null;
  lateCancelChargeAmount?: string | null;
  invoiceBusinessName?: string | null;
  invoiceAddress?: string | null;
  invoiceTaxId?: string | null;
  invoiceLogoUrl?: string | null;
  invoiceFooterNote?: string | null;
  autoSendInvoiceOnPackage: boolean;
  autoSendInvoiceOnSubscription: boolean;
  googleCalendarSyncEnabled: boolean;
  googleCalendarId?: string | null;
}

export default function SettingsPage() {
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
  const [allowIndividualSelfBook, setAllowIndividualSelfBook] = useState(true);
  const [allowGroupSelfBook, setAllowGroupSelfBook] = useState(true);
  const [enableWaitlist, setEnableWaitlist] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Cancellation policy
  const [cancelEnabled, setCancelEnabled] = useState(false);
  const [cancelWindowHours, setCancelWindowHours] = useState("24");
  const [cancelAction, setCancelAction] = useState<"deduct_session" | "charge">("deduct_session");
  const [cancelChargeAmount, setCancelChargeAmount] = useState("");
  const [cancelSaving, setCancelSaving] = useState(false);
  const [cancelSaved, setCancelSaved] = useState(false);

  // Stripe form
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [stripeSaving, setStripeSaving] = useState(false);
  const [stripeSaved, setStripeSaved] = useState(false);
  const [stripeError, setStripeError] = useState("");

  // Invoice settings
  const [invoiceBusinessName, setInvoiceBusinessName] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [invoiceTaxId, setInvoiceTaxId] = useState("");
  const [invoiceLogoUrl, setInvoiceLogoUrl] = useState("");
  const [invoiceFooterNote, setInvoiceFooterNote] = useState("");
  const [autoSendInvoiceOnPackage, setAutoSendInvoiceOnPackage] = useState(false);
  const [autoSendInvoiceOnSubscription, setAutoSendInvoiceOnSubscription] = useState(false);
  const [invoiceSaving, setInvoiceSaving] = useState(false);
  const [invoiceSaved, setInvoiceSaved] = useState(false);

  // Google Calendar
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gcalDisconnecting, setGcalDisconnecting] = useState(false);

  // Embed
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  function copyToClipboard(text: string, which: "link" | "embed") {
    navigator.clipboard.writeText(text);
    if (which === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  }

  // Availability
  type DaySlot = { enabled: boolean; startTime: string; endTime: string };
  const [availSlots, setAvailSlots] = useState<DaySlot[]>(
    DAYS.map(() => ({ enabled: false, startTime: DEFAULT_START, endTime: DEFAULT_END }))
  );
  const [availSaving, setAvailSaving] = useState(false);
  const [availSaved, setAvailSaved] = useState(false);
  async function fetchProvider() {
    try {
      const provRes = await fetch("/api/providers/me", { credentials: "include" });
      if (!provRes.ok) throw new Error(`HTTP ${provRes.status}`);
      const data = await provRes.json();
      const p: Provider = data.provider;
      if (!p) throw new Error("No provider found");
      setProvider(p);
      setName(p.name);
      setEmail(p.email ?? "");
      setPhone(p.phone ?? "");
      setServiceType(p.serviceType ?? "");
      setTimezone(p.timezone);
      setSessionDurationMins(String(p.sessionDurationMins));
      setCurrency(p.currency ?? "usd");
      setAllowIndividualSelfBook(p.allowIndividualSelfBook ?? true);
      setAllowGroupSelfBook(p.allowGroupSelfBook ?? true);
      setEnableWaitlist(p.enableWaitlist ?? false);
      const hasPolicy = !!p.lateCancelWindowHours && !!p.lateCancelAction;
      setCancelEnabled(hasPolicy);
      setCancelWindowHours(String(p.lateCancelWindowHours ?? 24));
      setCancelAction((p.lateCancelAction as "deduct_session" | "charge") ?? "deduct_session");
      setCancelChargeAmount(p.lateCancelChargeAmount ?? "");
      setInvoiceBusinessName(p.invoiceBusinessName ?? "");
      setInvoiceAddress(p.invoiceAddress ?? "");
      setInvoiceTaxId(p.invoiceTaxId ?? "");
      setInvoiceLogoUrl(p.invoiceLogoUrl ?? "");
      setInvoiceFooterNote(p.invoiceFooterNote ?? "");
      setAutoSendInvoiceOnPackage(p.autoSendInvoiceOnPackage ?? false);
      setAutoSendInvoiceOnSubscription(p.autoSendInvoiceOnSubscription ?? false);
      setGcalConnected(p.googleCalendarSyncEnabled ?? false);

      const availRes = await fetch(`/api/availability?providerId=${p.id}`);
      const availData = await availRes.json();
      const rows: { dayOfWeek: number; startTime: string; endTime: string }[] = availData.availability ?? [];
      setAvailSlots(DAYS.map((_, i) => {
        const row = rows.find((r) => r.dayOfWeek === i);
        return row
          ? { enabled: true, startTime: row.startTime, endTime: row.endTime }
          : { enabled: false, startTime: DEFAULT_START, endTime: DEFAULT_END };
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load provider settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProvider();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      const res = await fetch(`/api/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, serviceType, timezone, sessionDurationMins, currency, allowIndividualSelfBook, allowGroupSelfBook, enableWaitlist }),
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

  async function handleCancelPolicySave(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setCancelSaving(true);
    setCancelSaved(false);
    try {
      const payload = cancelEnabled
        ? {
            lateCancelWindowHours: cancelWindowHours,
            lateCancelAction: cancelAction,
            lateCancelChargeAmount: cancelAction === "charge" ? cancelChargeAmount : null,
          }
        : { lateCancelWindowHours: null, lateCancelAction: null, lateCancelChargeAmount: null };
      const res = await fetch(`/api/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setCancelSaved(true);
      setTimeout(() => setCancelSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCancelSaving(false);
    }
  }

  async function handleInvoiceSave(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setInvoiceSaving(true);
    setInvoiceSaved(false);
    try {
      const res = await fetch(`/api/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceBusinessName, invoiceAddress, invoiceTaxId,
          invoiceLogoUrl, invoiceFooterNote,
          autoSendInvoiceOnPackage, autoSendInvoiceOnSubscription,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setInvoiceSaved(true);
      setTimeout(() => setInvoiceSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setInvoiceSaving(false);
    }
  }

  // Handle Google Calendar OAuth callback query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gcal_connected") === "1") {
      setGcalConnected(true);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("gcal_error")) {
      setError("Google Calendar connection failed. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function handleGcalDisconnect() {
    if (!provider) return;
    if (!confirm("Disconnect Google Calendar? Bookings will no longer sync.")) return;
    setGcalDisconnecting(true);
    try {
      await fetch("/api/google-calendar/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: provider.id }),
      });
      setGcalConnected(false);
    } catch {
      setError("Failed to disconnect Google Calendar.");
    } finally {
      setGcalDisconnecting(false);
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

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="portal">Portal</TabsTrigger>
        </TabsList>

        {/* ── Profile ── */}
        <TabsContent value="profile" className="mt-6 space-y-6">
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
                <hr className="border-gray-100" />
                <div className="space-y-3">
                  <Label>Client Self-Booking</Label>
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm text-gray-700">Allow 1-to-1 self-booking</p>
                      <p className="text-xs text-gray-400">Clients can book individual sessions themselves</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowIndividualSelfBook}
                      onChange={(e) => setAllowIndividualSelfBook(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm text-gray-700">Allow group self-booking</p>
                      <p className="text-xs text-gray-400">Clients can book group sessions themselves</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowGroupSelfBook}
                      onChange={(e) => setAllowGroupSelfBook(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm text-gray-700">Enable waitlist for group sessions</p>
                      <p className="text-xs text-gray-400">When a group session is full, clients can join a waitlist and are notified when a spot opens</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableWaitlist}
                      onChange={(e) => setEnableWaitlist(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </label>
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
        </TabsContent>

        {/* ── Finance ── */}
        <TabsContent value="finance" className="mt-6 space-y-6">
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

          {/* Cancellation Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-gray-500" />
                Cancellation Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCancelPolicySave} className="space-y-4">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-sm text-gray-700">Enable late cancellation policy</p>
                    <p className="text-xs text-gray-400">Apply a penalty when clients cancel within a set window</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cancelEnabled}
                    onChange={(e) => setCancelEnabled(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                </label>
                {cancelEnabled && (
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    <div className="space-y-1">
                      <Label htmlFor="cancelWindow">Cancellation window (hours)</Label>
                      <Input
                        id="cancelWindow"
                        type="number"
                        min="1"
                        max="168"
                        value={cancelWindowHours}
                        onChange={(e) => setCancelWindowHours(e.target.value)}
                        className="w-32"
                      />
                      <p className="text-xs text-gray-400">Cancellations within this many hours of the session start are considered late</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Late cancellation penalty</Label>
                      <Select value={cancelAction} onValueChange={(v) => setCancelAction(v as "deduct_session" | "charge")}>
                        <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deduct_session">Deduct session credit</SelectItem>
                          <SelectItem value="charge">Charge a fee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {cancelAction === "charge" && (
                      <div className="space-y-1">
                        <Label htmlFor="cancelCharge">Charge amount ({currency.toUpperCase()})</Label>
                        <Input
                          id="cancelCharge"
                          type="number"
                          min="1"
                          step="0.01"
                          value={cancelChargeAmount}
                          onChange={(e) => setCancelChargeAmount(e.target.value)}
                          placeholder="e.g. 25.00"
                          className="w-40"
                        />
                        <p className="text-xs text-gray-400">Charged to the client&apos;s saved payment method. If no payment method is on file, a manual collection notice is logged.</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <Button type="submit" disabled={cancelSaving || !provider}>
                    {cancelSaving ? "Saving…" : "Save Policy"}
                  </Button>
                  {cancelSaved && (
                    <span className="flex items-center gap-1.5 text-sm text-green-600">
                      <Check className="h-4 w-4" /> Saved
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Invoice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-gray-500" />
                Invoice Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvoiceSave} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="invoiceBusinessName">Business Name</Label>
                    <Input
                      id="invoiceBusinessName"
                      value={invoiceBusinessName}
                      onChange={(e) => setInvoiceBusinessName(e.target.value)}
                      placeholder="Acme Fitness LLC"
                    />
                    <p className="text-xs text-gray-400">Appears on invoices instead of your display name</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="invoiceTaxId">Tax ID / VAT Number</Label>
                    <Input
                      id="invoiceTaxId"
                      value={invoiceTaxId}
                      onChange={(e) => setInvoiceTaxId(e.target.value)}
                      placeholder="e.g. US123456789"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="invoiceAddress">Business Address</Label>
                  <textarea
                    id="invoiceAddress"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                    value={invoiceAddress}
                    onChange={(e) => setInvoiceAddress(e.target.value)}
                    placeholder="123 Main St, New York, NY 10001"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Business Logo</Label>
                  {invoiceLogoUrl ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={invoiceLogoUrl}
                        alt="Invoice logo"
                        className="h-14 max-w-[180px] object-contain rounded border border-gray-200 bg-gray-50 p-1"
                      />
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="logoUpload" className="cursor-pointer text-xs text-indigo-600 hover:underline">
                          Replace image
                        </label>
                        <button
                          type="button"
                          onClick={() => setInvoiceLogoUrl("")}
                          className="text-xs text-red-500 hover:underline text-left"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="logoUpload"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    >
                      <svg className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-sm text-gray-500">Click to upload logo</span>
                      <span className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG — max 500 KB</span>
                    </label>
                  )}
                  <input
                    id="logoUpload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 500 * 1024) {
                        alert("Image must be under 500 KB");
                        e.target.value = "";
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => setInvoiceLogoUrl(reader.result as string);
                      reader.readAsDataURL(file);
                      e.target.value = "";
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="invoiceFooterNote">Footer Note</Label>
                  <textarea
                    id="invoiceFooterNote"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                    value={invoiceFooterNote}
                    onChange={(e) => setInvoiceFooterNote(e.target.value)}
                    placeholder="Thank you for your business! Payment is due within 7 days."
                  />
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-3">
                  <Label>Auto-send invoices</Label>
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm text-gray-700">Send when a package is assigned</p>
                      <p className="text-xs text-gray-400">Automatically email an invoice to the client when a package is manually assigned</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSendInvoiceOnPackage}
                      onChange={(e) => setAutoSendInvoiceOnPackage(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm text-gray-700">Send when a subscription is assigned</p>
                      <p className="text-xs text-gray-400">Automatically email an invoice to the client when a subscription is manually assigned</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSendInvoiceOnSubscription}
                      onChange={(e) => setAutoSendInvoiceOnSubscription(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Button type="submit" disabled={invoiceSaving || !provider}>
                    {invoiceSaving ? "Saving…" : "Save Invoice Settings"}
                  </Button>
                  {invoiceSaved && (
                    <span className="flex items-center gap-1.5 text-sm text-green-600">
                      <Check className="h-4 w-4" /> Saved
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Calendar ── */}
        <TabsContent value="calendar" className="mt-6 space-y-6">
          {/* Google Calendar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Google Calendar
                </CardTitle>
                {gcalConnected ? (
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Connected
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                    Not connected
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Sync your bookings to Google Calendar so sessions appear alongside your other events.
              </p>
              {gcalConnected ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                    Google Calendar is connected. New bookings will sync automatically.
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGcalDisconnect}
                    disabled={gcalDisconnecting || !provider}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {gcalDisconnecting ? "Disconnecting…" : "Disconnect"}
                  </Button>
                </div>
              ) : (
                <Button type="button" asChild disabled={!provider}>
                  <a href={`/api/google-calendar/connect?providerId=${provider?.id ?? ""}`}>
                    Connect Google Calendar
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Weekly Availability */}
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
        </TabsContent>

        {/* ── Portal ── */}
        <TabsContent value="portal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-4 w-4 text-gray-500" />
                Client Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-gray-500">
                Share the portal link directly with your clients, or embed it on your own website so they can log in and manage their sessions without leaving your site.
              </p>
              <div className="space-y-1.5">
                <Label>Portal link</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-mono text-gray-700 truncate select-all">
                    https://book.viv-z.com/portal
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => copyToClipboard("https://book.viv-z.com/portal", "link")}
                  >
                    {copiedLink ? (
                      <span className="flex items-center gap-1.5 text-green-600"><Check className="h-3.5 w-3.5" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><Copy className="h-3.5 w-3.5" /> Copy</span>
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Embed on your website</Label>
                <p className="text-xs text-gray-400">
                  Paste this snippet into any page on your website. The portal loads inside an inline frame. Google sign-in runs in the same frame (full redirect inside the iframe, not a new tab). Use a min-height so the iframe stays visible on small screens.
                </p>
                <pre className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap">{`<iframe\n  src="https://book.viv-z.com/portal"\n  width="100%"\n  height="700"\n  frameborder="0"\n  style="border:none;border-radius:12px;min-height:70vh;"\n  allow="payment"\n></iframe>`}</pre>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      `<iframe\n  src="https://book.viv-z.com/portal"\n  width="100%"\n  height="700"\n  frameborder="0"\n  style="border:none;border-radius:12px;min-height:70vh;"\n  allow="payment"\n></iframe>`,
                      "embed"
                    )
                  }
                >
                  {copiedEmbed ? (
                    <span className="flex items-center gap-1.5 text-green-600"><Check className="h-3.5 w-3.5" /> Copied</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><Copy className="h-3.5 w-3.5" /> Copy embed code</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
