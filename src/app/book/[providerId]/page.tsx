"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format, addDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Check, ChevronLeft, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Provider {
  id: string;
  name: string;
  serviceType?: string | null;
  sessionDurationMins: number;
  allowIndividualSelfBook: boolean;
  allowGroupSelfBook: boolean;
}

interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

interface GroupSession {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  participantCount: number;
  spotsRemaining: number;
  notes?: string | null;
}

type Step = "info" | "date" | "time" | "confirm" | "done";
type BookingMode = "individual" | "group" | null;
type GroupStep = "list" | "join" | "done";

export default function BookingPage() {
  const { providerId } = useParams<{ providerId: string }>();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [providerError, setProviderError] = useState("");

  // Multi-step state
  const [step, setStep] = useState<Step>("info");

  // Step 1 — client info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Step 2 — date picker (simple: browse days)
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [browseDate, setBrowseDate] = useState<Date>(startOfDay(new Date()));

  // Step 3 — time slot
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Step 4 — confirm / submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Available days of week from provider's schedule (0=Sun … 6=Sat)
  const [availableDays, setAvailableDays] = useState<Set<number>>(new Set());

  // Booking mode — null until user picks a tab
  const [bookingMode, setBookingMode] = useState<BookingMode>(null);

  // Group sessions tab
  const [groupStep, setGroupStep] = useState<GroupStep>("list");
  const [groupSessions, setGroupSessions] = useState<GroupSession[]>([]);
  const [loadingGroupSessions, setLoadingGroupSessions] = useState(false);
  const [selectedGroupSession, setSelectedGroupSession] = useState<GroupSession | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupEmail, setGroupEmail] = useState("");
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [groupJoinResult, setGroupJoinResult] = useState<{ sessionDeducted: boolean } | null>(null);

  // Load group sessions when mode switches to group (including auto-select on load)
  useEffect(() => {
    if (bookingMode === "group") loadGroupSessions();
  }, [bookingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function loadProvider() {
      try {
        const [provRes, availRes] = await Promise.all([
          fetch(`/api/providers?providerId=${providerId}`),
          fetch(`/api/availability?providerId=${providerId}`),
        ]);
        const data = await provRes.json();
        const availData = await availRes.json();
        if (!data.provider) throw new Error("Not found");
        setProvider(data.provider);
        const days = new Set<number>(
          (availData.availability ?? []).map((r: { dayOfWeek: number }) => r.dayOfWeek)
        );
        setAvailableDays(days);
        // Auto-select if only one mode is enabled
        if (data.provider.allowIndividualSelfBook && !data.provider.allowGroupSelfBook) {
          setBookingMode("individual");
        } else if (!data.provider.allowIndividualSelfBook && data.provider.allowGroupSelfBook) {
          setBookingMode("group");
          setGroupStep("list");
        }
      } catch {
        setProviderError("Provider not found.");
      } finally {
        setLoadingProvider(false);
      }
    }
    loadProvider();
  }, [providerId]);

  async function loadGroupSessions() {
    setLoadingGroupSessions(true);
    try {
      const res = await fetch(`/api/group-sessions?providerId=${providerId}`);
      const data = await res.json();
      setGroupSessions(data.sessions ?? []);
    } finally {
      setLoadingGroupSessions(false);
    }
  }

  async function loadSlots(date: Date) {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const res = await fetch(
        `/api/slots?providerId=${providerId}&date=${format(date, "yyyy-MM-dd")}`
      );
      const data = await res.json();
      setSlots(data.slots ?? []);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    loadSlots(date);
    setStep("time");
  }

  async function handleConfirm() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          clientName: name,
          clientEmail: email,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Booking failed");
      }
      setStep("done");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGroupJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGroupSession) return;
    setGroupSubmitting(true);
    setGroupError("");
    try {
      const res = await fetch(`/api/group-sessions/${selectedGroupSession.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: groupName, clientEmail: groupEmail, providerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Join failed");
      setGroupJoinResult(data);
      setGroupStep("done");
    } catch (err) {
      setGroupError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGroupSubmitting(false);
    }
  }

  function switchMode(mode: BookingMode) {
    setBookingMode(mode);
    if (mode === "group") {
      setGroupStep("list");
    } else if (mode === "individual") {
      setStep("info");
    }
  }

  if (loadingProvider) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">Loading…</div>;
  }
  if (providerError || !provider) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 text-sm">{providerError}</div>;
  }

  // Generate a simple 14-day picker grid
  const today = startOfDay(new Date());
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
          {provider.serviceType && (
            <p className="mt-1 text-sm text-gray-500">{provider.serviceType}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">Choose how you&apos;d like to book</p>
        </div>

        {/* Mode tab bar — only show if at least one mode is enabled, and only show enabled tabs */}
        {(provider.allowIndividualSelfBook || provider.allowGroupSelfBook) && (
          <div className="flex rounded-xl border border-gray-200 bg-white p-1 gap-1 shadow-sm">
            {provider.allowIndividualSelfBook && (
              <button
                type="button"
                onClick={() => switchMode("individual")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  bookingMode === "individual"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                1-to-1 Session
              </button>
            )}
            {provider.allowGroupSelfBook && (
              <button
                type="button"
                onClick={() => switchMode("group")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  bookingMode === "group"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Group Sessions
              </button>
            )}
          </div>
        )}
        {!provider.allowIndividualSelfBook && !provider.allowGroupSelfBook && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-sm text-gray-500">Online booking is not currently available.</p>
            </CardContent>
          </Card>
        )}

        {/* ── GROUP SESSIONS FLOW ── */}
        {bookingMode === "group" && groupStep === "list" && (
          <div className="space-y-3">
            {loadingGroupSessions ? (
              <p className="text-center text-sm text-gray-400 py-8">Loading sessions…</p>
            ) : groupSessions.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-sm text-gray-500">No upcoming group sessions available.</p>
                </CardContent>
              </Card>
            ) : (
              groupSessions.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{s.title}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(s.startTime), "EEE d MMM, HH:mm")} –{" "}
                          {format(new Date(s.endTime), "HH:mm")}
                        </p>
                        {s.notes && <p className="text-xs text-gray-400 truncate">{s.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                          {s.spotsRemaining} spot{s.spotsRemaining !== 1 ? "s" : ""} left
                        </Badge>
                        <Button
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => {
                            setSelectedGroupSession(s);
                            setGroupName("");
                            setGroupEmail("");
                            setGroupError("");
                            setGroupStep("join");
                          }}
                        >
                          Join
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {bookingMode === "group" && groupStep === "join" && selectedGroupSession && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Join: {selectedGroupSession.title}</CardTitle>
                <button
                  onClick={() => setGroupStep("list")}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {format(new Date(selectedGroupSession.startTime), "EEE d MMM, HH:mm")} –{" "}
                {format(new Date(selectedGroupSession.endTime), "HH:mm")}
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleGroupJoin}>
                <div className="space-y-1">
                  <Label htmlFor="gName">Name *</Label>
                  <Input
                    id="gName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gEmail">Email *</Label>
                  <Input
                    id="gEmail"
                    type="email"
                    value={groupEmail}
                    onChange={(e) => setGroupEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {groupError && <p className="text-sm text-red-600">{groupError}</p>}
                <Button type="submit" disabled={groupSubmitting} className="w-full bg-teal-600 hover:bg-teal-700">
                  {groupSubmitting ? "Joining…" : "Confirm & Join"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {bookingMode === "group" && groupStep === "done" && selectedGroupSession && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <Check className="h-6 w-6 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">You&apos;re in!</h2>
              <p className="text-sm text-gray-600 font-medium">{selectedGroupSession.title}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(selectedGroupSession.startTime), "EEEE, MMMM d")} at{" "}
                {format(new Date(selectedGroupSession.startTime), "HH:mm")}
              </p>
              {groupJoinResult?.sessionDeducted && (
                <p className="text-xs text-teal-600 bg-teal-50 rounded-lg px-3 py-2">
                  A session credit has been deducted from your package or subscription.
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setGroupStep("list"); loadGroupSessions(); }}
              >
                View other sessions
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── END GROUP SESSIONS FLOW ── */}

        {/* Done state */}
        {bookingMode === "individual" && step === "done" && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">You&apos;re booked!</h2>
              <p className="text-sm text-gray-500">
                {format(selectedDate, "EEEE, MMMM d")} at {selectedSlot?.label}
              </p>
              <p className="text-xs text-gray-400">A confirmation will be sent to {email}</p>
            </CardContent>
          </Card>
        )}

        {/* Step 1 — Client info */}
        {bookingMode === "individual" && step === "info" && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base">Your details</CardTitle>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {provider.sessionDurationMins} min session
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(e) => { e.preventDefault(); setStep("date"); }}
              >
                <div className="space-y-1">
                  <Label htmlFor="bkName">Name *</Label>
                  <Input
                    id="bkName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bkEmail">Email *</Label>
                  <Input
                    id="bkEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Choose a date →
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Date picker */}
        {bookingMode === "individual" && step === "date" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                  Pick a date
                </CardTitle>
                <button
                  onClick={() => setStep("info")}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                ))}
                {/* Offset for first day */}
                {Array.from({ length: today.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {days.map((day) => {
                  const isAvailable = availableDays.size === 0 || availableDays.has(day.getDay());
                  const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => isAvailable && handleDateSelect(day)}
                      disabled={!isAvailable}
                      title={!isAvailable ? "Not available" : undefined}
                      className={`rounded-lg py-2 text-sm font-medium transition-colors
                        ${isSelected && isAvailable
                          ? "bg-indigo-600 text-white"
                          : !isAvailable
                          ? "text-gray-300 cursor-not-allowed"
                          : "hover:bg-indigo-50 text-gray-700"
                        }`}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Time slot */}
        {bookingMode === "individual" && step === "time" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {format(selectedDate, "EEEE, MMMM d")}
                </CardTitle>
                <button
                  onClick={() => setStep("date")}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSlots ? (
                <p className="text-sm text-gray-400 text-center py-4">Loading times…</p>
              ) : slots.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-sm text-gray-500">No available times on this day.</p>
                  <Button variant="outline" size="sm" onClick={() => setStep("date")}>
                    Choose another date
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => { setSelectedSlot(slot); setStep("confirm"); }}
                      className="rounded-lg border border-gray-200 py-2 px-3 text-sm font-medium text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4 — Confirm */}
        {bookingMode === "individual" && step === "confirm" && selectedSlot && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Confirm booking</CardTitle>
                <button
                  onClick={() => setStep("time")}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{format(selectedDate, "EEE, MMM d")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{selectedSlot.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{provider.sessionDurationMins} min</span>
                </div>
              </div>

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}

              <Button
                className="w-full"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? "Booking…" : "Confirm Booking"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
