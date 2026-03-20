import { db } from "@/lib/db";
import { bookings, clientPackages, clientSubscriptions, clients } from "@/lib/db/schema";
import { eq, count, gte, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getAdminProviderId } from "@/lib/auth-provider";
import { redirect } from "next/navigation";

async function getDashboardStats(providerId: string) {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [upcomingBookings, totalClients, activePackages, revenueThisMonth] =
    await Promise.all([
      db
        .select()
        .from(bookings)
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
        .from(clientPackages)
        .innerJoin(clients, eq(clientPackages.clientId, clients.id))
        .where(
          and(
            eq(clients.providerId, providerId),
            eq(clientPackages.status, "active")
          )
        ),

      // Sessions booked this month
      db
        .select({ count: count() })
        .from(bookings)
        .where(
          and(
            eq(bookings.providerId, providerId),
            gte(
              bookings.startTime,
              new Date(now.getFullYear(), now.getMonth(), 1)
            )
          )
        ),
    ]);

  return {
    upcomingBookings,
    totalClients: totalClients[0]?.count ?? 0,
    activePackages: activePackages[0]?.count ?? 0,
    sessionsThisMonth: revenueThisMonth[0]?.count ?? 0,
  };
}

export default async function DashboardPage() {
  const providerId = await getAdminProviderId();
  if (!providerId) redirect("/setup");

  const stats = await getDashboardStats(providerId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your sessions and clients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={String(stats.totalClients)}
          icon={<Users className="h-5 w-5 text-indigo-600" />}
          href="/clients"
        />
        <StatCard
          title="Sessions This Month"
          value={String(stats.sessionsThisMonth)}
          icon={<CalendarDays className="h-5 w-5 text-green-600" />}
          href="/calendar"
        />
        <StatCard
          title="Active Packages"
          value={String(stats.activePackages)}
          icon={<Package className="h-5 w-5 text-orange-600" />}
          href="/packages"
        />
        <StatCard
          title="Upcoming (7 days)"
          value={String(stats.upcomingBookings.length)}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          href="/calendar"
        />
      </div>

      {/* Upcoming bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.upcomingBookings.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming sessions.
              <Link href="/calendar" className="ml-1 text-indigo-600 hover:underline">
                Add one on the calendar →
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.upcomingBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {b.title ?? "Session"}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(b.startTime)}</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 capitalize">
                    {b.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="rounded-lg bg-gray-50 p-2">{icon}</div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
