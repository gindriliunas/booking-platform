"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, Package, Repeat, CalendarDays, ExternalLink, Trash2, ClipboardList, CheckCircle2, Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientDialog } from "@/components/clients/client-dialog";
import { AssignDialog } from "@/components/clients/assign-dialog";
import { ResponseDialog } from "@/components/questionnaires/response-dialog";
import { formatDate, formatCurrency, formatDateOnly } from "@/lib/utils";
import { useProvider } from "@/components/provider-context";

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface ClientPackage {
  id: string;
  packageId: string;
  packageName: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  status: string;
  purchasedAt: string;
  expiresAt?: string | null;
  sessionType?: "individual" | "group";
  price?: string | null;
  currency?: string | null;
}

interface ClientSubscription {
  id: string;
  planId: string;
  planName: string;
  billingPeriod: string;
  status: string;
  sessionsUsedThisPeriod: number;
  sessionsPerPeriod: number;
  currentPeriodEnd?: string | null;
  createdAt: string;
  sessionType?: "individual" | "group";
  paymentMethod?: string | null;
  price?: string | null;
  currency?: string | null;
}

interface Booking {
  id: string;
  title?: string | null;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
}

interface Onboarding {
  hasFormCompleted: boolean;
  hasPackageOrSub: boolean;
  hasBooking: boolean;
  isComplete: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  exhausted: "bg-gray-100 text-gray-600",
  expired: "bg-red-50 text-red-600",
  refunded: "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-600",
  past_due: "bg-orange-50 text-orange-700",
  trialing: "bg-blue-50 text-blue-700",
  scheduled: "bg-indigo-50 text-indigo-700",
  completed: "bg-green-50 text-green-700",
  no_show: "bg-orange-50 text-orange-700",
};

export default function ClientDetailPage() {
  const { providerId: PROVIDER_ID } = useProvider();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";

  const [client, setClient] = useState<Client | null>(null);
  const [pkgs, setPkgs] = useState<ClientPackage[]>([]);
  const [subs, setSubs] = useState<ClientSubscription[]>([]);
  const [bkgs, setBkgs] = useState<Booking[]>([]);
  const [clientForms, setClientForms] = useState<{ id: string; title: string; status: string; assignedAt: string }[]>([]);
  const [availableQuestionnaires, setAvailableQuestionnaires] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [responseDialogId, setResponseDialogId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [deletingPkg, setDeletingPkg] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);

  // Available package templates and plans for selling
  const [availablePackages, setAvailablePackages] = useState<{ id: string; name: string; price: string; currency: string; sessionCount: number; sessionType?: "individual" | "group"; stripePriceId?: string | null }[]>([]);
  const [availablePlans, setAvailablePlans] = useState<{ id: string; name: string; price: string; currency: string; sessionsPerPeriod: number; billingPeriod: string; sessionType?: "individual" | "group"; stripePriceId?: string | null }[]>([]);

  const fetchData = useCallback(async () => {
    if (!PROVIDER_ID) return;
    setLoading(true);
    try {
      const [clientRes, pkgRes, planRes, formsRes, availFormsRes] = await Promise.all([
        fetch(`/api/clients/${id}`),
        fetch(`/api/packages?providerId=${PROVIDER_ID}`),
        fetch(`/api/subscriptions?providerId=${PROVIDER_ID}`),
        fetch(`/api/client-questionnaires?clientId=${id}`),
        fetch(`/api/questionnaires?providerId=${PROVIDER_ID}`),
      ]);
      const clientData = await clientRes.json();
      const pkgData = await pkgRes.json();
      const planData = await planRes.json();
      const formsData = await formsRes.json();
      const availFormsData = await availFormsRes.json();

      setClient(clientData.client);
      setPkgs(clientData.packages ?? []);
      setSubs(clientData.subscriptions ?? []);
      setBkgs(clientData.bookings ?? []);
      setOnboarding(clientData.onboarding ?? null);
      setClientForms(formsData.questionnaires ?? []);
      setAvailableQuestionnaires((availFormsData.questionnaires ?? []).filter((q: { isActive: boolean }) => q.isActive));
      setAvailablePackages((pkgData.packages ?? []).filter((p: { isActive: boolean }) => p.isActive));
      setAvailablePlans((planData.plans ?? []).filter((p: { isActive: boolean }) => p.isActive));
    } finally {
      setLoading(false);
    }
  }, [id, PROVIDER_ID]);

  async function handleAssignQuestionnaire(questionnaireId: string) {
    await fetch("/api/client-questionnaires", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: id, questionnaireId }),
    });
    fetchData();
  }

  async function handleRemoveForm(formId: string) {
    if (!confirm("Remove this questionnaire from the client?")) return;
    await fetch(`/api/client-questionnaires/${formId}`, { method: "DELETE" });
    fetchData();
  }

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDeletePackage(clientPackageId: string) {
    if (!confirm("Remove this package from the client?")) return;
    setDeletingPkg(clientPackageId);
    try {
      await fetch(`/api/client-packages/${clientPackageId}`, { method: "DELETE" });
      fetchData();
    } finally {
      setDeletingPkg(null);
    }
  }

  async function handleCancelSubscription(subId: string) {
    if (!confirm("Cancel this subscription? The client will lose access at the end of their current period.")) return;
    try {
      await fetch(`/api/client-subscriptions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      fetchData();
    } catch {
      alert("Failed to cancel subscription");
    }
  }

  async function handleSellPackage(packageId: string) {
    setCheckoutLoading(packageId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "package", itemId: packageId, clientId: id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Failed to create checkout session");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleSellSubscription(planId: string) {
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", itemId: planId, clientId: id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Failed to create checkout session");
    } finally {
      setCheckoutLoading(null);
    }
  }

  if (loading) return <div className="text-sm text-gray-500 py-8 text-center">Loading…</div>;
  if (!client) return <div className="text-sm text-red-600 py-8 text-center">Client not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {paymentSuccess && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          Payment successful! The package or subscription will be activated once the webhook is processed.
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/clients" className="mt-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{client.name}</h1>
          <div className="flex flex-wrap gap-4 mt-1">
            {client.email && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Mail className="h-3.5 w-3.5" /> {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Phone className="h-3.5 w-3.5" /> {client.phone}
              </span>
            )}
          </div>
          {client.notes && (
            <p className="mt-2 text-sm text-gray-600 italic">{client.notes}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
      </div>

      {/* Onboarding checklist — hidden once complete */}
      {onboarding && !onboarding.isComplete && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-amber-800">
              <ClipboardList className="h-4 w-4" />
              Onboarding Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { done: onboarding.hasFormCompleted, label: "Intake questionnaire completed" },
              { done: onboarding.hasPackageOrSub, label: "Package or subscription assigned" },
              { done: onboarding.hasBooking, label: "First session booked" },
            ].map(({ done, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-amber-400 shrink-0" />
                )}
                <span className={done ? "text-gray-500 line-through" : "text-amber-900"}>{label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Packages */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-500" />
              Packages
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
              + Assign
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pkgs.length === 0 ? (
            <p className="text-sm text-gray-500">No packages assigned yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {pkgs.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.packageName}</p>
                      {p.sessionType === "group" ? (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-medium shrink-0">Group</span>
                      ) : (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium shrink-0">1-to-1</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.sessionsRemaining}/{p.sessionsTotal} sessions remaining
                      {p.expiresAt && ` · expires ${formatDateOnly(p.expiresAt)}`}
                      {p.price && p.currency && ` · ${formatCurrency(p.price, p.currency)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 h-1.5 rounded-full bg-gray-200 hidden sm:block">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.round((p.sessionsRemaining / p.sessionsTotal) * 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                    <button
                      onClick={() => handleDeletePackage(p.id)}
                      disabled={deletingPkg === p.id}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors"
                      title="Remove package"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stripe checkout option (only if Stripe is configured) */}
          {availablePackages.some((p) => p.stripePriceId) && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Collect Payment via Stripe</p>
              <div className="flex flex-wrap gap-2">
                {availablePackages.filter((p) => p.stripePriceId).map((pkg) => (
                  <Button
                    key={pkg.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSellPackage(pkg.id)}
                    disabled={checkoutLoading === pkg.id}
                    className="text-xs"
                  >
                    {checkoutLoading === pkg.id ? "Loading…" : `${pkg.name} — ${formatCurrency(pkg.price, pkg.currency)} · ${pkg.sessionType === "group" ? "Group" : "1-to-1"}`}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscriptions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-purple-500" />
              Subscriptions
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
              + Assign
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subs.length === 0 ? (
            <p className="text-sm text-gray-500">No active subscriptions.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {subs.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.planName}</p>
                      {s.sessionType === "group" ? (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-medium shrink-0">Group</span>
                      ) : (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium shrink-0">1-to-1</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                      {s.sessionsUsedThisPeriod}/{s.sessionsPerPeriod} sessions this {s.billingPeriod.replace("ly", "")}
                      {s.currentPeriodEnd && ` · renews ${formatDateOnly(s.currentPeriodEnd)}`}
                      {s.price && s.currency && ` · ${formatCurrency(s.price, s.currency)}/${s.billingPeriod.replace("ly", "")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.paymentMethod && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 capitalize">
                        {s.paymentMethod === "bank" ? "Bank transfer" : s.paymentMethod}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.status.replace("_", " ")}
                    </span>
                    {s.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancelSubscription(s.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        title="Cancel subscription"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stripe checkout option (only if Stripe is configured) */}
          {availablePlans.some((p) => p.stripePriceId) && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Collect Payment via Stripe</p>
              <div className="flex flex-wrap gap-2">
                {availablePlans.filter((p) => p.stripePriceId).map((plan) => (
                  <Button
                    key={plan.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSellSubscription(plan.id)}
                    disabled={checkoutLoading === plan.id}
                    className="text-xs"
                  >
                    {checkoutLoading === plan.id
                      ? "Loading…"
                      : `${plan.name} — ${formatCurrency(plan.price, plan.currency)}/${plan.billingPeriod.replace("ly", "")} · ${plan.sessionType === "group" ? "Group" : "1-to-1"}`}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questionnaires */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-purple-500" />
              Questionnaires
            </CardTitle>
            {availableQuestionnaires.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  className="text-xs rounded-md border border-gray-200 px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) { handleAssignQuestionnaire(e.target.value); e.target.value = ""; } }}
                >
                  <option value="" disabled>Assign questionnaire…</option>
                  {availableQuestionnaires.map((q) => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {clientForms.length === 0 ? (
            <p className="text-sm text-gray-500">No questionnaires assigned yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {clientForms.map((f) => (
                <div key={f.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{f.title}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${f.status === "completed" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                      {f.status}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setResponseDialogId(f.id)}
                    >
                      {f.status === "completed" ? "View" : "Fill in"}
                    </Button>
                    <button
                      onClick={() => handleRemoveForm(f.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bkgs.length === 0 ? (
            <p className="text-sm text-gray-500">No sessions booked yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {bkgs
                .slice()
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .map((b) => (
                  <div key={b.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.title ?? "Session"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(b.startTime)}</p>
                      {b.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic truncate">{b.notes}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${STATUS_COLORS[b.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {b.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ClientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        providerId={PROVIDER_ID}
        client={client}
        onSuccess={() => { setEditOpen(false); fetchData(); router.refresh(); }}
        onDelete={() => router.push("/clients")}
      />

      <AssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        clientId={id}
        packages={availablePackages}
        plans={availablePlans}
        onSuccess={() => { setAssignOpen(false); fetchData(); }}
      />

      <ResponseDialog
        open={!!responseDialogId}
        onOpenChange={(o) => { if (!o) setResponseDialogId(null); }}
        assignmentId={responseDialogId}
        clientName={client?.name}
        onSuccess={() => { setResponseDialogId(null); fetchData(); }}
      />
    </div>
  );
}
