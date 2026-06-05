"use client";

import { useState, useEffect, useCallback } from "react";
import { SessionCalendar, type CalendarEvent } from "@/components/calendar/session-calendar";
import { useProvider } from "@/components/provider-context";

type BookingApiRow = {
  id: string;
  title?: string | null;
  startTime: string;
  endTime: string;
  status?: string;
  clientId?: string;
  clientPackageId?: string | null;
  clientSubscriptionId?: string | null;
  sessionSource?: CalendarEvent["sessionSource"];
  notes?: string | null;
  sessionType?: CalendarEvent["sessionType"];
  maxParticipants?: number | null;
  bookingSeriesId?: string | null;
  client?: { name?: string | null } | null;
  participants?: unknown[];
};

type BlockedTimeApiRow = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
};

type CalendarPageData = {
  events: CalendarEvent[];
  clients: { id: string; name: string; email?: string | null }[];
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
};

async function fetchCalendarPageData(providerId: string): Promise<CalendarPageData> {
  const [evtRes, clientRes, availRes] = await Promise.all([
    fetch(`/api/bookings?providerId=${providerId}`),
    fetch(`/api/clients?providerId=${providerId}`),
    fetch(`/api/availability?providerId=${providerId}`),
  ]);
  const evtData = await evtRes.json();
  const clientData = await clientRes.json();
  const availData = await availRes.json();

  const bookingEvents: CalendarEvent[] = (evtData.bookings ?? []).map((b: BookingApiRow) => ({
    id: b.id,
    title: b.title ?? "Session",
    start: new Date(b.startTime),
    end: new Date(b.endTime),
    type: "booking" as const,
    status: b.status,
    clientName: b.client?.name ?? undefined,
    clientId: b.clientId,
    clientPackageId: b.clientPackageId ?? null,
    clientSubscriptionId: b.clientSubscriptionId ?? null,
    sessionSource: b.sessionSource ?? null,
    notes: b.notes ?? undefined,
    sessionType: b.sessionType ?? "individual",
    participantCount: b.participants?.length ?? 0,
    maxParticipants: b.maxParticipants ?? null,
    bookingSeriesId: b.bookingSeriesId ?? null,
  }));

  const blockedEvents: CalendarEvent[] = (evtData.blockedTimes ?? []).map(
    (bt: BlockedTimeApiRow) => ({
      id: bt.id,
      title: bt.title,
      start: new Date(bt.startTime),
      end: new Date(bt.endTime),
      type: "blocked" as const,
    })
  );

  return {
    events: [...bookingEvents, ...blockedEvents],
    clients: clientData.clients ?? [],
    availability: availData.availability ?? [],
  };
}

export default function CalendarPage() {
  const { providerId: PROVIDER_ID } = useProvider();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string; email?: string | null }[]>([]);
  const [availability, setAvailability] = useState<
    { dayOfWeek: number; startTime: string; endTime: string }[]
  >([]);

  const applyPageData = useCallback((data: CalendarPageData) => {
    setEvents(data.events);
    setClients(data.clients);
    setAvailability(data.availability);
  }, []);

  const loadData = useCallback(async () => {
    if (!PROVIDER_ID) return;
    const data = await fetchCalendarPageData(PROVIDER_ID);
    applyPageData(data);
  }, [PROVIDER_ID, applyPageData]);

  useEffect(() => {
    if (!PROVIDER_ID) return;
    let cancelled = false;

    void fetchCalendarPageData(PROVIDER_ID).then((data) => {
      if (!cancelled) applyPageData(data);
    });

    return () => {
      cancelled = true;
    };
  }, [PROVIDER_ID, applyPageData]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="mt-1 text-sm text-gray-500">
          Click a time slot to book a session, or drag to select a range.
        </p>
      </div>
      <SessionCalendar
        events={events}
        providerId={PROVIDER_ID}
        clients={clients}
        availability={availability}
        onEventUpdate={loadData}
      />
    </div>
  );
}
