import { db } from "@/lib/db";
import { bookings, clientPackages, clients, packages } from "@/lib/db/schema";
import { eq, count, gte, and, lt, sql } from "drizzle-orm";
import Link from "next/link";
import { getAdminProviderId } from "@/lib/auth-provider";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { formatCurrency } from "@/lib/utils";
import { MiniCalendar } from "./mini-calendar";
import { Plus } from "lucide-react";

const DOT_COLORS = [
  "bg-indigo-500",
  "bg-green-500",
  "bg-orange-400",
  "bg-blue-400",
  "bg-teal-500",
];

async function getDashboardStats(providerId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayCount,
    upcomingBookings,
    totalClients,
    sessionsThisMonth,
    revenueMTD,
    todaySessions,
  ] = await Promise.all([
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
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          gte(bookings.startTime, monthStart)
        )
      ),

    db
      .select({
        total: sql<string>`COALESCE(SUM(${packages.price}::numeric), 0)`,
      })
      .from(clientPackages)
      .innerJoin(clients, eq(clientPackages.clientId, clients.id))
      .innerJoin(packages, eq(clientPackages.packageId, packages.id))
      .where(
        and(
          eq(clients.providerId, providerId),
          gte(clientPackages.purchasedAt, monthStart)
        )
      ),

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

  return {
    todayCount: todayCount[0]?.count ?? 0,
    upcomingBookings,
    totalClients: totalClients[0]?.count ?? 0,
    sessionsThisMonth: sessionsThisMonth[0]?.count ?? 0,
    revenueMTD: parseFloat(revenueMTD[0]?.total ?? "0"),
    todayFirst: todaySessions[0] ?? null,
    todayLast: todaySessions[todaySessions.length - 1] ?? null,
  };
}

function fmtTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function sessionLabel(startTime: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const d = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(startTime);
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
          trend="↑ 2 vs yesterday"
        />
        <StatCard
          title="Active Clients"
          value={String(stats.totalClients)}
          trend="↑ 3 this week"
        />
        <StatCard
          title="Sessions This Month"
          value={String(stats.sessionsThisMonth)}
          trend="↑ 12% vs last month"
        />
        <StatCard
          title="Revenue (MTD)"
          value={formatCurrency(stats.revenueMTD)}
          trend="↑ $480 vs last month"
        />
      </div>

      {/* Main content: 2/3 + 1/3 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Upcoming Sessions
          </h2>
          {stats.upcomingBookings.length === 0 ? (
            <p className="text-sm text-gray-500 mt-4">
              No upcoming sessions.{" "}
              <Link href="/calendar" className="text-indigo-600 hover:underline">
                Add one on the calendar →
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 mt-2">
              {stats.upcomingBookings.map((b, i) => {
                const start = new Date(b.startTime);
                const end = new Date(b.endTime);
                const durationMins = Math.round(
                  (end.getTime() - start.getTime()) / 60000
                );
                const label = sessionLabel(start);
                const timeStr = fmtTime(start);
                const dot = DOT_COLORS[i % DOT_COLORS.length];

                return (
                  <li
                    key={b.id}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${dot} shrink-0`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {b.clientName ?? b.title ?? "Session"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {label} · {timeStr} · {durationMins} min
                        </p>
                      </div>
                    </div>
                    <span
                      className={`ml-4 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        b.status === "scheduled"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {b.status === "scheduled" ? "Confirmed" : "Pending"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Mini Calendar */}
          <MiniCalendar />

          {/* Today's Load */}
          <div className="rounded-2xl bg-white shadow-sm p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Today&apos;s Load
            </p>
            {stats.todayCount === 0 ? (
              <p className="text-sm text-gray-500">No sessions today</p>
            ) : (
              <div className="rounded-xl bg-indigo-50 px-4 py-3">
                <p className="text-lg font-bold text-indigo-900">
                  {stats.todayCount}{" "}
                  {stats.todayCount === 1 ? "session" : "sessions"}
                </p>
                {stats.todayFirst && stats.todayLast && (
                  <p className="text-sm text-indigo-600 mt-0.5">
                    {fmtTime(new Date(stats.todayFirst.startTime))} &ndash;{" "}
                    {fmtTime(new Date(stats.todayLast.endTime))}
                  </p>
                )}
              </div>
            )}
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
  return (
    <div className="rounded-2xl bg-white shadow-sm p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1.5 text-xs font-medium text-green-600">{trend}</p>
    </div>
  );
}
