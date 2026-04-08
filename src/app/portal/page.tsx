import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  clientPackages,
  clientSubscriptions,
  bookings,
  bookingParticipants,
  packages,
  subscriptionPlans,
  clientQuestionnaires,
  questionnaires,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, CalendarDays } from "lucide-react";
import { LocalTime } from "@/components/local-time";
import Link from "next/link";

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-indigo-50 text-indigo-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  no_show: "bg-orange-50 text-orange-700",
};

export default async function PortalDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upcomingPage?: string; pastPage?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/portal/sign-in");

  const sp = await searchParams;
  const upcomingPage = Math.max(1, parseInt(sp.upcomingPage ?? "1"));
  const pastPage = Math.max(1, parseInt(sp.pastPage ?? "1"));

  const client = await getPortalClient(session.uid);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 max-w-md text-center">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">Account Not Found</h2>
          <p className="text-sm text-amber-700">
            We couldn&apos;t find a client account associated with your email address.
            Please contact your provider to get access set up.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();

  const [
    activePkgs,
    activeSubs,
    individualBookings,
    groupParticipations,
    pendingForms,
  ] = await Promise.all([
    db
      .select({
        sessionsRemaining: clientPackages.sessionsRemaining,
        sessionType: packages.sessionType,
      })
      .from(clientPackages)
      .innerJoin(packages, eq(clientPackages.packageId, packages.id))
      .where(and(eq(clientPackages.clientId, client.id), eq(clientPackages.status, "active"))),
    db
      .select({
        sessionsPerPeriod: clientSubscriptions.sessionsPerPeriod,
        sessionsUsedThisPeriod: clientSubscriptions.sessionsUsedThisPeriod,
        sessionType: subscriptionPlans.sessionType,
      })
      .from(clientSubscriptions)
      .innerJoin(subscriptionPlans, eq(clientSubscriptions.planId, subscriptionPlans.id))
      .where(and(eq(clientSubscriptions.clientId, client.id), eq(clientSubscriptions.status, "active"))),
    db.select().from(bookings).where(eq(bookings.clientId, client.id)),
    db
      .select({ booking: bookings })
      .from(bookingParticipants)
      .innerJoin(bookings, eq(bookingParticipants.bookingId, bookings.id))
      .where(eq(bookingParticipants.clientId, client.id)),
    db
      .select({
        id: clientQuestionnaires.id,
        title: questionnaires.title,
      })
      .from(clientQuestionnaires)
      .innerJoin(questionnaires, eq(clientQuestionnaires.questionnaireId, questionnaires.id))
      .where(
        and(
          eq(clientQuestionnaires.clientId, client.id),
          eq(clientQuestionnaires.status, "pending")
        )
      ),
  ]);

  const seen = new Set<string>();
  const allBookings = [
    ...individualBookings,
    ...groupParticipations.map((r) => r.booking),
  ].filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });

  const upcomingAll = allBookings
    .filter((b) => b.status === "scheduled" && new Date(b.startTime) >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const pastAll = allBookings
    .filter((b) => b.status !== "scheduled" || new Date(b.startTime) < now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const upcomingTotalPages = Math.max(1, Math.ceil(upcomingAll.length / PAGE_SIZE));
  const pastTotalPages = Math.max(1, Math.ceil(pastAll.length / PAGE_SIZE));

  const upcomingBookings = upcomingAll.slice(
    (upcomingPage - 1) * PAGE_SIZE,
    upcomingPage * PAGE_SIZE
  );
  const pastBookings = pastAll.slice((pastPage - 1) * PAGE_SIZE, pastPage * PAGE_SIZE);

  const individualRemaining =
    activePkgs
      .filter((p) => p.sessionType === "individual")
      .reduce((sum, p) => sum + p.sessionsRemaining, 0) +
    activeSubs
      .filter((s) => s.sessionType === "individual")
      .reduce((sum, s) => sum + Math.max(0, s.sessionsPerPeriod - s.sessionsUsedThisPeriod), 0);

  const groupRemaining =
    activePkgs
      .filter((p) => p.sessionType === "group")
      .reduce((sum, p) => sum + p.sessionsRemaining, 0) +
    activeSubs
      .filter((s) => s.sessionType === "group")
      .reduce((sum, s) => sum + Math.max(0, s.sessionsPerPeriod - s.sessionsUsedThisPeriod), 0);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {client.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here&apos;s your session overview.</p>
      </div>

      {/* Pending questionnaire notification */}
      {pendingForms.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm font-medium text-amber-900">
            You have {pendingForms.length} form{pendingForms.length > 1 ? "s" : ""} to fill in
          </p>
          <ul className="mt-2 space-y-1">
            {pendingForms.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/portal/questionnaire/${f.id}`}
                  className="text-sm text-amber-700 underline"
                >
                  {f.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-indigo-50 p-2 shrink-0">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{individualRemaining}</p>
              <p className="text-sm text-gray-500">1-2-1 Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-purple-50 p-2 shrink-0">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{groupRemaining}</p>
              <p className="text-sm text-gray-500">Group Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-green-50 p-2 shrink-0">
              <CalendarDays className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingAll.length}</p>
              <p className="text-sm text-gray-500">Upcoming Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAll.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming sessions scheduled.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {upcomingBookings.map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{b.title ?? "Session"}</p>
                        {b.sessionType === "group" && (
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                            Group
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500"><LocalTime date={b.startTime} /></p>
                      {b.notes && (
                        <p className="text-xs text-gray-400 italic mt-0.5">{b.notes}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[b.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {b.status}
                    </span>
                  </li>
                ))}
              </ul>
              {upcomingTotalPages > 1 && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-2">
                  {upcomingPage > 1 && (
                    <Link
                      href={`?upcomingPage=${upcomingPage - 1}&pastPage=${pastPage}`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      &larr; Prev
                    </Link>
                  )}
                  <span className="text-sm text-gray-500">
                    {upcomingPage} / {upcomingTotalPages}
                  </span>
                  {upcomingPage < upcomingTotalPages && (
                    <Link
                      href={`?upcomingPage=${upcomingPage + 1}&pastPage=${pastPage}`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Next &rarr;
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Past sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Past Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {pastAll.length === 0 ? (
            <p className="text-sm text-gray-500">No past sessions.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {pastBookings.map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{b.title ?? "Session"}</p>
                        {b.sessionType === "group" && (
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                            Group
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500"><LocalTime date={b.startTime} /></p>
                      {b.notes && (
                        <p className="text-xs text-gray-400 italic mt-0.5">{b.notes}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[b.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
              {pastTotalPages > 1 && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-2">
                  {pastPage > 1 && (
                    <Link
                      href={`?upcomingPage=${upcomingPage}&pastPage=${pastPage - 1}`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      &larr; Prev
                    </Link>
                  )}
                  <span className="text-sm text-gray-500">
                    {pastPage} / {pastTotalPages}
                  </span>
                  {pastPage < pastTotalPages && (
                    <Link
                      href={`?upcomingPage=${upcomingPage}&pastPage=${pastPage + 1}`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Next &rarr;
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
