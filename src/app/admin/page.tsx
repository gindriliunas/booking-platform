import { db } from "@/lib/db";
import { providers, clients, websiteClients, pageViews, partnerSpots, adClicks } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { adminAuth } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { count, gte, desc, eq, sql, asc } from "drizzle-orm";
import { Users, Building2, Globe, TrendingUp, Eye, Activity } from "lucide-react";
import { SnippetButton } from "./snippet-modal";
import { AddWebsiteClientButton, EditWebsiteClientButton, DeleteWebsiteClientButton } from "./add-website-client";
import { PartnerSpotsManager } from "./partner-spots";
import { EmbedSnippetButton } from "./embed-snippet";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "g.indriliunas@gmail.com";

async function getAdminStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProviders,
    totalClients,
    totalWebsiteClients,
    newProvidersThisMonth,
    totalPageViews,
    todayPageViews,
    monthPageViews,
    recentProviders,
    allWebsiteClients,
    trafficBysite,
    spots,
    clickRows,
  ] = await Promise.all([
    db.select({ count: count() }).from(providers),
    db.select({ count: count() }).from(clients),
    db.select({ count: count() }).from(websiteClients),
    db.select({ count: count() }).from(providers).where(gte(providers.createdAt, monthStart)),
    db.select({ count: count() }).from(pageViews),
    db.select({ count: count() }).from(pageViews).where(gte(pageViews.createdAt, todayStart)),
    db.select({ count: count() }).from(pageViews).where(gte(pageViews.createdAt, monthStart)),
    db
      .select({
        id: providers.id,
        name: providers.name,
        email: providers.email,
        serviceType: providers.serviceType,
        createdAt: providers.createdAt,
      })
      .from(providers)
      .orderBy(desc(providers.createdAt))
      .limit(20),
    db
      .select({
        id: websiteClients.id,
        name: websiteClients.name,
        email: websiteClients.email,
        phone: websiteClients.phone,
        businessName: websiteClients.businessName,
        businessType: websiteClients.businessType,
        customDomain: websiteClients.customDomain,
        previewUrl: websiteClients.previewUrl,
        status: websiteClients.status,
        notes: websiteClients.notes,
      })
      .from(websiteClients)
      .orderBy(desc(websiteClients.createdAt)),
    db
      .select({
        websiteClientId: pageViews.websiteClientId,
        total: count(),
        today: sql<number>`COUNT(*) FILTER (WHERE ${pageViews.createdAt} >= ${todayStart})`,
        thisMonth: sql<number>`COUNT(*) FILTER (WHERE ${pageViews.createdAt} >= ${monthStart})`,
      })
      .from(pageViews)
      .groupBy(pageViews.websiteClientId),
    db.select().from(partnerSpots).where(eq(partnerSpots.isActive, true)).orderBy(asc(partnerSpots.position)),
    db.select({ partnerSpotId: adClicks.partnerSpotId, clicks: count() })
      .from(adClicks)
      .groupBy(adClicks.partnerSpotId),
  ]);

  const trafficMap = new Map(trafficBysite.map((r) => [r.websiteClientId, r]));

  const websitesWithTraffic = allWebsiteClients.map((site) => {
    const t = trafficMap.get(site.id);
    return {
      ...site,
      total: Number(t?.total ?? 0),
      today: Number(t?.today ?? 0),
      thisMonth: Number(t?.thisMonth ?? 0),
    };
  });

  const clickMap = new Map(clickRows.map((r) => [r.partnerSpotId, Number(r.clicks)]));
  const spotsWithClicks = spots.map((s) => ({ ...s, clicks: clickMap.get(s.id) ?? 0 }));

  return {
    totalProviders: totalProviders[0]?.count ?? 0,
    totalClients: totalClients[0]?.count ?? 0,
    totalWebsiteClients: totalWebsiteClients[0]?.count ?? 0,
    newProvidersThisMonth: newProvidersThisMonth[0]?.count ?? 0,
    totalPageViews: totalPageViews[0]?.count ?? 0,
    todayPageViews: todayPageViews[0]?.count ?? 0,
    monthPageViews: monthPageViews[0]?.count ?? 0,
    recentProviders,
    websitesWithTraffic,
    spots: spotsWithClicks,
  };
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const firebaseUser = await adminAuth.getUser(session.uid).catch(() => null);
  if (firebaseUser?.email !== ADMIN_EMAIL) redirect("/dashboard");

  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform overview — viv-z</p>
        </div>

        {/* Platform Stat Cards */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Platform</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Building2 className="h-5 w-5 text-indigo-600" />}
              label="Business Users"
              value={stats.totalProviders}
              sub="Total providers"
            />
            <StatCard
              icon={<Users className="h-5 w-5 text-emerald-600" />}
              label="Total Members"
              value={stats.totalClients}
              sub="Clients across all providers"
            />
            <StatCard
              icon={<Globe className="h-5 w-5 text-blue-600" />}
              label="Website Clients"
              value={stats.totalWebsiteClients}
              sub="Website service signups"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
              label="New This Month"
              value={stats.newProvidersThisMonth}
              sub="Business users joined"
            />
          </div>
        </section>

        {/* Traffic Stat Cards */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Traffic (all websites)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Eye className="h-5 w-5 text-rose-500" />}
              label="Total Pageviews"
              value={stats.totalPageViews}
              sub="All time"
            />
            <StatCard
              icon={<Activity className="h-5 w-5 text-orange-500" />}
              label="Today"
              value={stats.todayPageViews}
              sub="Pageviews today"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-teal-500" />}
              label="This Month"
              value={stats.monthPageViews}
              sub="Pageviews this month"
            />
          </div>
        </section>

        {/* Website Clients + Traffic Table */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Website clients</h2>
            <AddWebsiteClientButton />
          </div>
          <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
            {stats.websitesWithTraffic.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-400">No website clients yet.</p>
                <p className="text-xs text-gray-300 mt-1">Click &quot;Add website client&quot; to create one.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Business", "Status", "Today", "This Month", "All Time", "Tracking", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.websitesWithTraffic.map((site) => (
                    <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{site.businessName}</p>
                        <p className="text-xs text-gray-400">
                          {site.customDomain ?? site.previewUrl ?? "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={site.status} />
                      </td>
                      <td className="px-5 py-3 tabular-nums text-gray-700">
                        {site.today.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 tabular-nums text-gray-700">
                        {site.thisMonth.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 tabular-nums font-semibold text-gray-900">
                        {site.total.toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <SnippetButton siteId={site.id} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <EditWebsiteClientButton client={site} />
                          <DeleteWebsiteClientButton id={site.id} name={site.businessName} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Partner Spots */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Partner ad spots</h2>
              <p className="text-xs text-gray-300 mt-0.5">4 slots shown on every client website</p>
            </div>
            <EmbedSnippetButton />
          </div>
          <PartnerSpotsManager spots={stats.spots} />
        </section>

        {/* Recent Providers Table */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Recent business users</h2>
          <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
            {stats.recentProviders.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400">No providers yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Name", "Email", "Service Type", "Joined"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentProviders.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-3 text-gray-500">{p.email ?? "—"}</td>
                      <td className="px-6 py-3 text-gray-500">{p.serviceType ?? "—"}</td>
                      <td className="px-6 py-3 text-gray-400 tabular-nums">
                        {p.createdAt.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-6">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  );
}

const STATUS_COLOURS: Record<string, string> = {
  building: "bg-yellow-100 text-yellow-700",
  preview_live: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOURS[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status.replace("_", " ")}
    </span>
  );
}


