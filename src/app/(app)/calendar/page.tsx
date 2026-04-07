"use client";

import { useState, useEffect, useCallback } from "react";
import { SessionCalendar, type CalendarEvent } from "@/components/calendar/session-calendar";
import { useProvider } from "@/components/provider-context";

export default function CalendarPage() {
  const { providerId: PROVIDER_ID } = useProvider();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string; email?: string | null }[]>([]);
  const [availability, setAvailability] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);

  const loadData = useCallback(async () => {
    if (!PROVIDER_ID) return;
    const [evtRes, clientRes, availRes] = await Promise.all([
      fetch(`/api/bookings?providerId=${PROVIDER_ID}`),
      fetch(`/api/clients?providerId=${PROVIDER_ID}`),
      fetch(`/api/availability?providerId=${PROVIDER_ID}`),
    ]);
    const evtData = await evtRes.json();
    const clientData = await clientRes.json();
    const availData = await availRes.json();
    setAvailability(availData.availability ?? []);

    const bookingEvents: CalendarEvent[] = (evtData.bookings ?? []).map((b: any) => ({
      id: b.id,
      title: b.title ?? "Session",
      start: new Date(b.startTime),
      end: new Date(b.endTime),
      type: "booking" as const,
      status: b.status,
      clientName: b.client?.name,
      clientId: b.clientId,
      notes: b.notes,
      sessionType: b.sessionType ?? "individual",
      participantCount: b.participants?.length ?? 0,
      maxParticipants: b.maxParticipants ?? null,
      bookingSeriesId: b.bookingSeriesId ?? null,
    }));

    const blockedEvents: CalendarEvent[] = (evtData.blockedTimes ?? []).map((bt: any) => ({
      id: bt.id,
      title: bt.title,
      start: new Date(bt.startTime),
      end: new Date(bt.endTime),
      type: "blocked" as const,
    }));

    setEvents([...bookingEvents, ...blockedEvents]);
    setClients(clientData.clients ?? []);
  }, [PROVIDER_ID]);

  useEffect(() => { loadData(); }, [loadData]);

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
