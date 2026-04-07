"use client";

const DOT_COLORS = [
  "bg-indigo-500",
  "bg-green-500",
  "bg-orange-400",
  "bg-blue-400",
  "bg-teal-500",
];

function fmtTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function sessionLabel(startTime: Date): string {
  const now = new Date();
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const d = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(startTime);
}

type Booking = {
  id: string;
  title: string | null;
  startTime: Date;
  endTime: Date;
  status: string;
  clientName: string | null;
};

export function UpcomingSessions({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <p className="text-sm text-gray-500 mt-4">
        No upcoming sessions.{" "}
        <a href="/calendar" className="text-indigo-600 hover:underline">
          Add one on the calendar →
        </a>
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 mt-2">
      {bookings.map((b, i) => {
        const start = new Date(b.startTime);
        const end   = new Date(b.endTime);
        const durationMins = Math.round((end.getTime() - start.getTime()) / 60000);
        const dot = DOT_COLORS[i % DOT_COLORS.length];

        return (
          <li key={b.id} className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`h-2.5 w-2.5 rounded-full ${dot} shrink-0`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {b.clientName ?? b.title ?? "Session"}
                </p>
                <p className="text-xs text-gray-500">
                  {sessionLabel(start)} · {fmtTime(start)} · {durationMins} min
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
  );
}

export function TodayLoad({
  count,
  firstStart,
  lastEnd,
}: {
  count: number;
  firstStart: Date | null;
  lastEnd: Date | null;
}) {
  if (count === 0) {
    return <p className="text-sm text-gray-500">No sessions today</p>;
  }

  return (
    <div className="rounded-xl bg-indigo-50 px-4 py-3">
      <p className="text-lg font-bold text-indigo-900">
        {count} {count === 1 ? "session" : "sessions"}
      </p>
      {firstStart && lastEnd && (
        <p className="text-sm text-indigo-600 mt-0.5">
          {fmtTime(new Date(firstStart))} &ndash; {fmtTime(new Date(lastEnd))}
        </p>
      )}
    </div>
  );
}
