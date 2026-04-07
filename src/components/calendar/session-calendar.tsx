"use client";

import { useState, useCallback, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addHours,
  startOfHour,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingDialog } from "./booking-dialog";
import { BlockTimeDialog } from "./block-time-dialog";
import { GroupSessionDialog } from "./group-session-dialog";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "booking" | "blocked";
  status?: string;
  clientName?: string;
  clientId?: string;
  notes?: string;
  sessionType?: "individual" | "group";
  participantCount?: number;
  maxParticipants?: number;
  bookingSeriesId?: string | null;
};

interface SessionCalendarProps {
  events: CalendarEvent[];
  providerId: string;
  clients: { id: string; name: string; email?: string | null }[];
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
  onEventUpdate: () => void;
}

const eventStyleGetter = (event: CalendarEvent) => {
  if (event.type === "blocked") {
    return {
      style: {
        backgroundColor: "#f3f4f6",
        color: "#6b7280",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
      },
    };
  }
  if (event.sessionType === "group") {
    const groupColors: Record<string, { bg: string; color: string; border: string }> = {
      scheduled: { bg: "#f0fdfa", color: "#0f766e", border: "#2dd4bf" },
      completed: { bg: "#f0fdf4", color: "#15803d", border: "#22c55e" },
      cancelled: { bg: "#fef2f2", color: "#b91c1c", border: "#f87171" },
      no_show: { bg: "#fff7ed", color: "#c2410c", border: "#fb923c" },
    };
    const c = groupColors[event.status ?? "scheduled"] ?? groupColors.scheduled;
    return {
      style: {
        backgroundColor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: "6px",
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
      backgroundColor: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: "6px",
    },
  };
};

function parseTime(t: string): Date {
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function SessionCalendar({
  events,
  providerId,
  clients,
  availability,
  onEventUpdate,
}: SessionCalendarProps) {
  // Derive earliest start and latest end across all enabled days
  const calMin = availability.length
    ? parseTime(availability.reduce((a, b) => (a.startTime < b.startTime ? a : b)).startTime)
    : parseTime("06:00");
  const calMax = availability.length
    ? parseTime(availability.reduce((a, b) => (a.endTime > b.endTime ? a : b)).endTime)
    : parseTime("22:00");
  const [view, setView] = useState<View>(Views.WEEK);
  useEffect(() => {
    if (window.innerWidth < 768) setView(Views.DAY);
  }, []);
  const [date, setDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [groupInitialMode, setGroupInitialMode] = useState<"individual" | "group">("individual");

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    setGroupInitialMode("individual");
    setBookingOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    if (event.sessionType === "group") {
      setGroupOpen(true);
    } else {
      setBookingOpen(true);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar extras */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => {
            const now = startOfHour(new Date());
            setSelectedSlot({ start: now, end: addHours(now, 1) });
            setSelectedEvent(null);
            setGroupInitialMode("individual");
            setBookingOpen(true);
          }}
        >
          + Book Session
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-teal-300 text-teal-700 hover:bg-teal-50"
          onClick={() => {
            const now = startOfHour(new Date());
            setSelectedSlot({ start: now, end: addHours(now, 1) });
            setSelectedEvent(null);
            setGroupInitialMode("group");
            setBookingOpen(true);
          }}
        >
          + Group Session
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const now = startOfHour(new Date());
            setSelectedSlot({ start: now, end: addHours(now, 1) });
            setBlockOpen(true);
          }}
        >
          Block Time
        </Button>
        {/* Legend — hidden on mobile */}
        <div className="hidden sm:flex ml-auto items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-indigo-100 border border-indigo-400" /> Scheduled
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-green-100 border border-green-400" /> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-red-100 border border-red-400" /> Cancelled
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-orange-100 border border-orange-400" /> No Show
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-teal-50 border border-teal-400" /> Group
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-gray-100 border border-gray-300" /> Blocked
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ height: "min(680px, calc(100vh - 200px))" }}>
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          startAccessor="start"
          endAccessor="end"
          titleAccessor={(e) => {
            if (e.sessionType === "group") {
              const count = e.participantCount ?? 0;
              const max = e.maxParticipants ?? "?";
              return `${e.title ?? "Group Session"} — ${count}/${max}`;
            }
            return e.clientName ? `${e.title ?? "Session"} — ${e.clientName}` : (e.title ?? "Session");
          }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          step={30}
          timeslots={2}
          min={calMin}
          max={calMax}
          className="p-2"
        />
      </div>

      {/* Booking dialog (individual + group creation) */}
      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        providerId={providerId}
        clients={clients}
        slot={selectedSlot}
        event={selectedEvent}
        initialSessionType={groupInitialMode}
        onSuccess={() => {
          setBookingOpen(false);
          onEventUpdate();
        }}
      />

      {/* Group session management dialog */}
      <GroupSessionDialog
        open={groupOpen}
        onOpenChange={setGroupOpen}
        event={selectedEvent}
        clients={clients}
        onSuccess={() => {
          setGroupOpen(false);
          onEventUpdate();
        }}
      />

      {/* Block time dialog */}
      <BlockTimeDialog
        open={blockOpen}
        onOpenChange={setBlockOpen}
        providerId={providerId}
        slot={selectedSlot}
        onSuccess={() => {
          setBlockOpen(false);
          onEventUpdate();
        }}
      />
    </div>
  );
}
