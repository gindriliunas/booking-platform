"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

type DayAvail = { dayOfWeek: number; startTime: string; endTime: string };

type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "booking" | "group";
  status?: string;
  maxParticipants?: number | null;
  participantCount?: number;
  alreadyJoined?: boolean;
  isFull?: boolean;
  isWaitlisted?: boolean;
  waitlistPosition?: number | null;
  waitlistStatus?: string | null;
};

type GroupSession = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  maxParticipants: number | null;
  participantCount: number;
  alreadyJoined: boolean;
  isFull: boolean;
  isWaitlisted: boolean;
  waitlistPosition: number | null;
  waitlistStatus: string | null;
};

type BusyPeriod = { start: Date; end: Date };

function parseHHMM(hhmm: string, baseDate: Date): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

function isSlotAvailable(
  slotStart: Date,
  sessionMins: number,
  weeklyAvail: DayAvail[],
  busyPeriods: BusyPeriod[],
  now: Date
): boolean {
  const avail = weeklyAvail.find((a) => a.dayOfWeek === slotStart.getDay());
  if (!avail) return false;
  const slotEnd = new Date(slotStart.getTime() + sessionMins * 60_000);
  if (slotEnd <= now) return false;
  const windowStart = parseHHMM(avail.startTime, slotStart);
  const windowEnd = parseHHMM(avail.endTime, slotStart);
  if (slotStart < windowStart || slotEnd > windowEnd) return false;
  for (const busy of busyPeriods) {
    if (slotStart < busy.end && slotEnd > busy.start) return false;
  }
  return true;
}

function eventStyleGetter(event: CalEvent) {
  if (event.type === "group") {
    if (event.alreadyJoined) {
      return {
        style: {
          backgroundColor: "#ccfbf1", color: "#0f766e",
          border: "2px solid #0d9488", borderRadius: "6px", cursor: "pointer",
        },
      };
    }
    if (event.isWaitlisted) {
      return {
        style: {
          backgroundColor: "#fef3c7", color: "#92400e",
          border: "2px solid #f59e0b", borderRadius: "6px", cursor: "pointer",
        },
      };
    }
    const isFull = event.isFull ?? (event.maxParticipants != null && (event.participantCount ?? 0) >= event.maxParticipants);
    return {
      style: {
        backgroundColor: isFull ? "#f9fafb" : "#f0fdfa",
        color: isFull ? "#6b7280" : "#0f766e",
        border: `1px solid ${isFull ? "#d1d5db" : "#2dd4bf"}`,
        borderRadius: "6px", cursor: "pointer",
      },
    };
  }
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    scheduled: { bg: "#eef2ff", color: "#4338ca", border: "#6366f1" },
    completed: { bg: "#f0fdf4", color: "#15803d", border: "#22c55e" },
    cancelled: { bg: "#fef2f2", color: "#b91c1c", border: "#f87171" },
    no_show: { bg: "#fff7ed", color: "#c2410c", border: "#fb923c" },
  };
  const c = colors[event.status ?? "scheduled"] ?? colors.scheduled;
  return {
    style: {
      backgroundColor: c.bg, color: c.color,
      border: `1px solid ${c.border}`, borderRadius: "6px", cursor: "pointer",
    },
  };
}

function groupSessionToEvent(s: GroupSession): CalEvent {
  const isFull = s.isFull ?? (s.maxParticipants != null && s.participantCount >= s.maxParticipants);
  let titleSuffix = s.maxParticipants ? ` (${s.participantCount}/${s.maxParticipants})` : "";
  if (s.isWaitlisted) titleSuffix += ` — Waitlisted #${s.waitlistPosition}`;
  return {
    id: `group-${s.id}`,
    title: `${s.title}${titleSuffix}`,
    start: new Date(s.start),
    end: new Date(s.end),
    type: "group" as const,
    status: s.status,
    maxParticipants: s.maxParticipants,
    participantCount: s.participantCount,
    alreadyJoined: s.alreadyJoined,
    isFull,
    isWaitlisted: s.isWaitlisted,
    waitlistPosition: s.waitlistPosition,
    waitlistStatus: s.waitlistStatus,
  };
}

export default function PortalBookPage() {
  const [weeklyAvail, setWeeklyAvail] = useState<DayAvail[]>([]);
  const [sessionDurationMins, setSessionDurationMins] = useState(60);
  const [myBookings, setMyBookings] = useState<CalEvent[]>([]);
  const [groupSessions, setGroupSessions] = useState<CalEvent[]>([]);
  const [enableWaitlist, setEnableWaitlist] = useState(false);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [noAccount, setNoAccount] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");

  // Dialog states
  const [confirmSlot, setConfirmSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [confirmGroup, setConfirmGroup] = useState<CalEvent | null>(null);
  const [viewJoinedGroup, setViewJoinedGroup] = useState<CalEvent | null>(null);
  const [viewWaitlistedGroup, setViewWaitlistedGroup] = useState<CalEvent | null>(null);
  const [cancelBooking, setCancelBooking] = useState<CalEvent | null>(null);
  const [cancelWarning, setCancelWarning] = useState<string | null>(null);
  const [leaveGroupSession, setLeaveGroupSession] = useState<CalEvent | null>(null);
  const [leaveGroupWarning, setLeaveGroupWarning] = useState<string | null>(null);

  const loadGroupSessions = useCallback(async () => {
    const data = await fetch("/api/portal/group-sessions", { cache: "no-store" }).then((r) => r.json());
    if (data.sessions) {
      setGroupSessions(data.sessions.map(groupSessionToEvent));
      setEnableWaitlist(data.enableWaitlist ?? false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/portal/me").then((r) => r.json()),
      fetch("/api/portal/bookings").then((r) => r.json()),
      fetch("/api/portal/group-sessions").then((r) => r.json()),
      fetch("/api/portal/availability").then((r) => r.json()),
    ])
      .then(([meData, bkData, gsData, availData]) => {
        if (!meData.client?.providerId) { setNoAccount(true); return; }
        if (bkData.bookings) {
          setMyBookings(
            bkData.bookings
              .filter((b: { sessionType?: string }) => b.sessionType !== "group")
              .map((b: { id: string; title: string; start: string; end: string; status: string }) => ({
                id: b.id, title: b.title,
                start: new Date(b.start), end: new Date(b.end),
                type: "booking" as const, status: b.status,
              }))
          );
        }
        if (gsData.sessions) {
          setGroupSessions(gsData.sessions.map(groupSessionToEvent));
          setEnableWaitlist(gsData.enableWaitlist ?? false);
        }
        if (availData.weeklyAvailability) setWeeklyAvail(availData.weeklyAvailability);
        if (availData.sessionDurationMins) setSessionDurationMins(availData.sessionDurationMins);
      })
      .finally(() => setLoading(false));
  }, []);

  const busyPeriods = useMemo<BusyPeriod[]>(
    () => [
      ...myBookings.map((e) => ({ start: e.start, end: e.end })),
      ...groupSessions.map((e) => ({ start: e.start, end: e.end })),
    ],
    [myBookings, groupSessions]
  );

  const slotPropGetter = useCallback(
    (slotDate: Date) => {
      const available = isSlotAvailable(slotDate, sessionDurationMins, weeklyAvail, busyPeriods, new Date());
      return available ? {} : { style: { backgroundColor: "#f1f5f9" } };
    },
    [sessionDurationMins, weeklyAvail, busyPeriods]
  );

  const handleSelectSlot = useCallback(
    ({ start, action }: { start: Date; end: Date; action: string }) => {
      if (action !== "click") return;
      if (!isSlotAvailable(start, sessionDurationMins, weeklyAvail, busyPeriods, new Date())) return;
      const end = new Date(start.getTime() + sessionDurationMins * 60_000);
      setConfirmSlot({ start, end });
      setActionError("");
    },
    [sessionDurationMins, weeklyAvail, busyPeriods]
  );

  async function handleConfirmBook() {
    if (!confirmSlot) return;
    setActing(true);
    setActionError("");
    try {
      const res = await fetch("/api/portal/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: confirmSlot.start.toISOString(), endTime: confirmSlot.end.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to book");
      setMyBookings((prev) => [
        ...prev,
        {
          id: data.booking.id, title: "Session",
          start: new Date(data.booking.startTime), end: new Date(data.booking.endTime),
          type: "booking", status: "scheduled",
        },
      ]);
      setConfirmSlot(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActing(false);
    }
  }

  async function handleJoinGroup() {
    if (!confirmGroup) return;
    setActing(true);
    setActionError("");
    try {
      const bookingId = confirmGroup.id.replace("group-", "");
      const res = await fetch(`/api/portal/group-sessions/${bookingId}/join`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to join");
      if (data.waitlisted) {
        // Added to waitlist
        setGroupSessions((prev) =>
          prev.map((s) => {
            if (s.id !== confirmGroup.id) return s;
            return {
              ...s, isWaitlisted: true, waitlistPosition: data.position, waitlistStatus: "waiting",
              title: `${s.title.replace(/ — Waitlisted.*$/, "")} — Waitlisted #${data.position}`,
            };
          })
        );
      } else {
        await loadGroupSessions();
      }
      setConfirmGroup(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActing(false);
    }
  }

  // Cancel individual booking
  async function handleCancelBooking(confirmed = false) {
    if (!cancelBooking) return;
    setActing(true);
    setActionError("");
    try {
      const res = await fetch(`/api/portal/bookings/${cancelBooking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel");
      if (data.requiresConfirmation) {
        setCancelWarning(data.warningMessage);
        setActing(false);
        return;
      }
      setMyBookings((prev) =>
        prev.map((b) => b.id === cancelBooking.id ? { ...b, status: "cancelled" } : b)
      );
      setCancelBooking(null);
      setCancelWarning(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActing(false);
    }
  }

  // Leave group session
  async function handleLeaveGroup(confirmed = false) {
    if (!leaveGroupSession) return;
    setActing(true);
    setActionError("");
    try {
      const bookingId = leaveGroupSession.id.replace("group-", "");
      const res = await fetch(`/api/portal/group-sessions/${bookingId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to leave");
      if (data.requiresConfirmation) {
        setLeaveGroupWarning(data.warningMessage);
        setActing(false);
        return;
      }
      await loadGroupSessions();
      setLeaveGroupSession(null);
      setLeaveGroupWarning(null);
      setViewJoinedGroup(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActing(false);
    }
  }

  // Leave waitlist
  async function handleLeaveWaitlist() {
    if (!viewWaitlistedGroup) return;
    setActing(true);
    setActionError("");
    try {
      const bookingId = viewWaitlistedGroup.id.replace("group-", "");
      const res = await fetch(`/api/portal/group-sessions/${bookingId}/waitlist`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to leave waitlist");
      await loadGroupSessions();
      setViewWaitlistedGroup(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActing(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500 py-8">Loading&hellip;</div>;

  if (noAccount) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 max-w-md">
        <p className="text-sm text-amber-700">No client account linked. Please contact your provider.</p>
      </div>
    );
  }

  const allEvents = [...myBookings, ...groupSessions];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Book a Session</h1>
        <span className="text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
          {sessionDurationMins} min sessions
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-white border border-gray-300" /> Available — click to book
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-slate-100 border border-slate-200" /> Unavailable
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-teal-50 border border-teal-400" /> Group session
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-amber-100 border border-amber-400" /> Waitlisted
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-indigo-100 border border-indigo-400" /> My booking
        </span>
      </div>

      {weeklyAvail.length === 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          No availability has been configured yet. Please contact your provider.
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ height: 680 }}>
        <Calendar
          localizer={localizer}
          events={allEvents}
          view={view}
          onView={setView}
          date={date}
          onNavigate={(d) => setDate(d)}
          eventPropGetter={eventStyleGetter}
          slotPropGetter={slotPropGetter}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          step={30}
          timeslots={2}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(event: CalEvent) => {
            setActionError("");
            if (event.type === "group") {
              if (event.alreadyJoined) {
                setViewJoinedGroup(event);
              } else if (event.isWaitlisted) {
                setViewWaitlistedGroup(event);
              } else {
                setConfirmGroup(event);
              }
            } else if (event.type === "booking" && event.status === "scheduled") {
              setCancelWarning(null);
              setCancelBooking(event);
            }
          }}
          className="p-2"
        />
      </div>

      {/* Slot booking confirmation */}
      <Dialog open={!!confirmSlot} onOpenChange={(open) => { if (!open) { setConfirmSlot(null); setActionError(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Booking</DialogTitle></DialogHeader>
          {confirmSlot && (
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-medium">{format(confirmSlot.start, "EEEE d MMMM yyyy")}</p>
              <p>
                {format(confirmSlot.start, "h:mm a")} &ndash; {format(confirmSlot.end, "h:mm a")}{" "}
                <span className="text-gray-400">({sessionDurationMins} min)</span>
              </p>
            </div>
          )}
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setConfirmSlot(null); setActionError(""); }}>Cancel</Button>
            <Button onClick={handleConfirmBook} disabled={acting}>{acting ? "Booking…" : "Confirm"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual booking view / cancel */}
      <Dialog open={!!cancelBooking} onOpenChange={(open) => { if (!open) { setCancelBooking(null); setCancelWarning(null); setActionError(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Your Booking</DialogTitle></DialogHeader>
          {cancelBooking && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{cancelBooking.title}</p>
              <p className="text-sm text-gray-700">
                {format(cancelBooking.start, "EEEE d MMMM yyyy")},{" "}
                {format(cancelBooking.start, "h:mm a")} &ndash; {format(cancelBooking.end, "h:mm a")}
              </p>
              <p className="text-xs inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700 font-medium capitalize">
                {cancelBooking.status}
              </p>
              {cancelWarning && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  {cancelWarning}
                </div>
              )}
              {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            </div>
          )}
          <div className="flex justify-between gap-2 pt-2">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleCancelBooking(!!cancelWarning)}
              disabled={acting}
            >
              {acting ? "Cancelling…" : cancelWarning ? "Confirm Cancellation" : "Cancel Booking"}
            </Button>
            <Button variant="outline" onClick={() => { setCancelBooking(null); setCancelWarning(null); setActionError(""); }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Already joined group session — with leave option */}
      <Dialog open={!!viewJoinedGroup} onOpenChange={(open) => { if (!open) { setViewJoinedGroup(null); setLeaveGroupWarning(null); setActionError(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Session Booked</DialogTitle></DialogHeader>
          {viewJoinedGroup && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                {viewJoinedGroup.title.replace(/\s*\(\d+\/\d+\)/, "").replace(/ — Waitlisted.*$/, "").trim()}
              </p>
              <p className="text-sm text-gray-700">
                {format(viewJoinedGroup.start, "EEEE d MMMM yyyy")},{" "}
                {format(viewJoinedGroup.start, "h:mm a")} &ndash; {format(viewJoinedGroup.end, "h:mm a")}
              </p>
              <p className="text-sm text-teal-700 font-medium">You are booked into this session.</p>
              {leaveGroupWarning && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  {leaveGroupWarning}
                </div>
              )}
              {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            </div>
          )}
          <div className="flex justify-between gap-2 pt-2">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                setLeaveGroupSession(viewJoinedGroup);
                handleLeaveGroup(!!leaveGroupWarning);
              }}
              disabled={acting}
            >
              {acting ? "Leaving…" : leaveGroupWarning ? "Confirm Leave" : "Leave Session"}
            </Button>
            <Button variant="outline" onClick={() => { setViewJoinedGroup(null); setLeaveGroupWarning(null); setActionError(""); }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* On waitlist dialog */}
      <Dialog open={!!viewWaitlistedGroup} onOpenChange={(open) => { if (!open) { setViewWaitlistedGroup(null); setActionError(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>You&apos;re on the Waitlist</DialogTitle></DialogHeader>
          {viewWaitlistedGroup && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                {viewWaitlistedGroup.title.replace(/\s*\(\d+\/\d+\)/, "").replace(/ — Waitlisted.*$/, "").trim()}
              </p>
              <p className="text-sm text-gray-700">
                {format(viewWaitlistedGroup.start, "EEEE d MMMM yyyy")},{" "}
                {format(viewWaitlistedGroup.start, "h:mm a")} &ndash; {format(viewWaitlistedGroup.end, "h:mm a")}
              </p>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800 font-medium">
                  Position #{viewWaitlistedGroup.waitlistPosition} on the waitlist
                </p>
                {viewWaitlistedGroup.waitlistStatus === "notified" && (
                  <p className="text-sm text-amber-700 mt-1">
                    A spot opened up! Visit your portal to claim it.
                  </p>
                )}
              </div>
              {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            </div>
          )}
          <div className="flex justify-between gap-2 pt-2">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLeaveWaitlist}
              disabled={acting}
            >
              {acting ? "Leaving…" : "Leave Waitlist"}
            </Button>
            <Button variant="outline" onClick={() => { setViewWaitlistedGroup(null); setActionError(""); }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group session join dialog */}
      <Dialog open={!!confirmGroup} onOpenChange={(open) => { if (!open) { setConfirmGroup(null); setActionError(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmGroup?.isFull && enableWaitlist ? "Join Waitlist" : "Join Group Session"}
            </DialogTitle>
          </DialogHeader>
          {confirmGroup && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                {confirmGroup.title.replace(/\s*\(\d+\/\d+\)$/, "").trim()}
              </p>
              <p className="text-sm text-gray-700">
                {format(confirmGroup.start, "EEEE d MMMM yyyy")},{" "}
                {format(confirmGroup.start, "h:mm a")} &ndash; {format(confirmGroup.end, "h:mm a")}
              </p>
              {confirmGroup.isFull && enableWaitlist ? (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  This session is full. You can join the waitlist and will be notified if a spot opens.
                </div>
              ) : confirmGroup.maxParticipants != null ? (
                <p className="text-xs text-gray-500">
                  {confirmGroup.maxParticipants - (confirmGroup.participantCount ?? 0)} spot
                  {confirmGroup.maxParticipants - (confirmGroup.participantCount ?? 0) === 1 ? "" : "s"} remaining
                </p>
              ) : null}
            </div>
          )}
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setConfirmGroup(null); setActionError(""); }}>Cancel</Button>
            <Button
              onClick={handleJoinGroup}
              disabled={acting || (confirmGroup?.isFull && !enableWaitlist)}
              className={confirmGroup?.isFull && enableWaitlist ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              {acting ? "…" : confirmGroup?.isFull && enableWaitlist ? "Join Waitlist" : "Join Session"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
