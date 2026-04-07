import { db } from "@/lib/db";
import { bookings, clientPackages, clients, packages, providers } from "@/lib/db/schema";
import { eq, count, gte, and, lt, sql } from "drizzle-orm";
import { getAdminProviderId } from "@/lib/auth-provider";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { formatCurrency } from "@/lib/utils";
import { MiniCalendar } from "./mini-calendar";
import { UpcomingSessions, TodayLoad } from "./upcoming-sessions";
import { Plus } from "lucide-react";


async function getDashboardStats(providerId: string) {
  const now = new Date();

  const todayStart      = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd        = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const yesterdayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const weekAgo         = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const monthStart      = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd    = new Date(now.getFullYear(), now.getMonth(), 1);

  const revenueQuery = (from: Date, to?: Date) =>
    db
      .select({ total: sql<string>`COALESCE(SUM(${packages.price}::numeric), 0)` })
      .from(clientPackages)
      .innerJoin(clients, eq(clientPackages.clientId, clients.id))
      .innerJoin(packages, eq(clientPackages.packageId, packages.id))
      .where(
        and(
          eq(clients.providerId, providerId),
          gte(clientPackages.purchasedAt, from),
          ...(to ? [lt(clientPackages.purchasedAt, to)] : [])
        )
      );

  const [
    provider,
    todayCount,
    yesterdayCount,
    upcomingBookings,
    totalClients,
    newClientsThisWeek,
    sessionsThisMonth,
    sessionsLastMonth,
    revenueMTD,
    revenueLastMonth,
    todaySessions,
  ] = await Promise.all([
    db
      .select({ currency: providers.currency })
      .from(providers)
      .where(eq(providers.id, providerId))
      .then((r) => r[0]),

    db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          gte(bookings.startTime, todayStart),
          lt(bookings.startTime, todayEnd)
        )
      ),

    db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          gte(bookings.startTime, yesterdayStart),
          lt(bookings.startTime, todayStart)
        )
      ),

    db
      .select({
        id: bookings.id,
        title: bookings.title,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        clientName: clients.name,
      })
      .from(bookings)
      .leftJoin(clients, eq(bookings.clientId, clients.id))
      .where(
        and(
          eq(bookings.providerId, providerId),
          eq(bookings.status, "scheduled"),
          gte(bookings.startTime, now)
        )
      )
      .orderBy(bookings.startTime)
      .limit(5),

    db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.providerId, providerId)),

    db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.providerId, providerId),
          gte(clients.createdAt, weekAgo)
        )
      ),

    db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          gte(bookings.startTime, monthStart)
        )
      ),

    db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          gte(bookings.startTime, lastMonthStart),
          lt(bookings.startTime, lastMonthEnd)
        )
      ),

    revenueQuery(monthStart),
    revenueQuery(lastMonthStart, lastMonthEnd),

    db
      .select({ startTime: bookings.startTime, endTime: bookings.endTime })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          gte(bookings.startTime, todayStart),
          lt(bookings.startTime, todayEnd)
        )
      )
      .orderBy(bookings.startTime),
  ]);

  const currency = provider?.currency ?? "usd";

  const todayN     = todayCount[0]?.count ?? 0;
  const yesterdayN = yesterdayCount[0]?.count ?? 0;
  const totalC     = totalClients[0]?.count ?? 0;
  const newThisWeek = newClientsThisWeek[0]?.count ?? 0;
  const sessionsNow  = sessionsThisMonth[0]?.count ?? 0;
  const sessionsLast = sessionsLastMonth[0]?.count ?? 0;
  const revNow  = parseFloat(revenueMTD[0]?.total ?? "0");
  const revLast = parseFloat(revenueLastMonth[0]?.total ?? "0");

  function diffLabel(now: number, prev: number, unit: string, suffix: string): string {
    const diff = now - prev;
    if (diff === 0) return `Same as ${suffix}`;
    return `${diff > 0 ? "↑" : "↓"} ${Math.abs(diff)} ${unit} vs ${suffix}`;
  }

  function pctLabel(now: number, prev: number, suffix: string): string {
    if (prev === 0 && now === 0) return `Same as ${suffix}`;
    if (prev === 0) return `↑ ${now} vs ${suffix}`;
    const pct = Math.round(((now - prev) / prev) * 100);
    if (pct === 0) return `Same as ${suffix}`;
    return `${pct > 0 ? "↑" : "↓"} ${Math.abs(pct)}% vs ${suffix}`;
  }

  function revLabel(now: number, prev: number, cur: string, suffix: string): string {
    const diff = now - prev;
    if (diff === 0) return `Same as ${suffix}`;
    const abs = formatCurrency(Math.abs(diff), cur);
    return `${diff > 0 ? "↑" : "↓"} ${abs} vs ${suffix}`;
  }

  return {
    currency,
    todayCount:       todayN,
    upcomingBookings,
    totalClients:     totalC,
    sessionsThisMonth: sessionsNow,
    revenueMTD:        revNow,
    todayFirst: todaySessions[0] ?? null,
    todayLast:  todaySessions[todaySessions.length - 1] ?? null,
    trends: {
      today:    diffLabel(todayN,    yesterdayN,  "session",  "yesterday"),
      clients:  newThisWeek === 0
        ? "No new clients this week"
        : `+${newThisWeek} new this week`,
      sessions: pctLabel(sessionsNow, sessionsLast, "last month"),
      revenue:  revLabel(revNow, revLast, currency, "last month"),
    },
  };
}


export default async function DashboardPage() {
  const providerId = await getAdminProviderId();
  if (!providerId) redirect("/setup");

  const [stats, user] = await Promise.all([
    getDashboardStats(providerId),
    currentUser(),
  ]);

  const initials = user
    ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() || "U"
    : "U";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/calendar"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm select-none">
            {initials}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sessions"
          value={String(stats.todayCount)}
          trend={stats.trends.today}
        />
        <StatCard
          title="Active Clients"
          value={String(stats.totalClients)}
          trend={stats.trends.clients}
        />
        <StatCard
          title="Sessions This Month"
          value={String(stats.sessionsThisMonth)}
          trend={stats.trends.sessions}
        />
        <StatCard
          title="Revenue (MTD)"
          value={formatCurrency(stats.revenueMTD, stats.currency)}
          trend={stats.trends.revenue}
        />
      </div>

      {/* Main content: 2/3 + 1/3 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Upcoming Sessions
          </h2>
          <UpcomingSessions bookings={stats.upcomingBookings} />
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <MiniCalendar />

          {/* Today's Load */}
          <div className="rounded-2xl bg-white shadow-sm p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Today&apos;s Load
            </p>
            <TodayLoad
              count={stats.todayCount}
              firstStart={stats.todayFirst?.startTime ?? null}
              lastEnd={stats.todayLast?.endTime ?? null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
}: {
  title: string;
  value: string;
  trend: string;
}) {
  const isUp   = trend.startsWith("↑");
  const isDown = trend.startsWith("↓");
  return (
    <div className="rounded-2xl bg-white shadow-sm p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p
        className={`mt-1.5 text-xs font-medium ${
          isUp ? "text-green-600" : isDown ? "text-red-500" : "text-gray-400"
        }`}
      >
        {trend}
      </p>
    </div>
  );
}
