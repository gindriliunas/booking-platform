"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CalendarEvent } from "./session-calendar";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  clients: { id: string; name: string; email?: string | null }[];
  slot: { start: Date; end: Date } | null;
  event: CalendarEvent | null;
  initialSessionType?: "individual" | "group";
  onSuccess: () => void;
}

const STATUS_OPTIONS = ["scheduled", "completed", "cancelled", "no_show"] as const;
type EditScope = "one" | "this_and_future" | "all";

export function BookingDialog({
  open,
  onOpenChange,
  providerId,
  clients,
  slot,
  event,
  initialSessionType = "individual",
  onSuccess,
}: Props) {
  const isEdit = !!event && event.type === "booking";
  const isSeries = isEdit && !!event?.bookingSeriesId;

  const [sessionType, setSessionType] = useState<"individual" | "group">(initialSessionType);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("Session");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<string>("scheduled");
  const [notes, setNotes] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientPackages, setClientPackages] = useState<
    { id: string; packageName: string; sessionsRemaining: number }[]
  >([]);
  const [selectedPackageId, setSelectedPackageId] = useState("none");

  // Recurrence (create mode only)
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState("4");

  // Series edit/delete scope
  const [editScope, setEditScope] = useState<EditScope>("one");
  const [showScopeForDelete, setShowScopeForDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setRepeatEnabled(false);
    setEditScope("one");
    setShowScopeForDelete(false);
    if (event && event.type === "booking") {
      const evtSessionType = event.sessionType ?? "individual";
      setSessionType(evtSessionType);
      setClientId(event.clientId ?? "");
      setTitle(event.title ?? "Session");
      setStartTime(formatForInput(event.start));
      setEndTime(formatForInput(event.end));
      setStatus(event.status ?? "scheduled");
      setNotes(event.notes ?? "");
      setMaxParticipants(String(event.maxParticipants ?? 10));
      setSelectedPackageId("none");
    } else if (slot) {
      setSessionType(initialSessionType);
      setClientId("");
      setTitle(initialSessionType === "group" ? "Group Session" : "Session");
      setStartTime(formatForInput(slot.start));
      setEndTime(formatForInput(slot.end));
      setStatus("scheduled");
      setNotes("");
      setMaxParticipants("10");
      setSelectedPackageId("none");
    }
  }, [event, slot, open, initialSessionType]);

  useEffect(() => {
    if (!clientId || sessionType === "group") { setClientPackages([]); return; }
    fetch(`/api/clients/${clientId}/packages?sessionType=individual`)
      .then((r) => r.json())
      .then((data) => setClientPackages(data.packages ?? []))
      .catch(() => setClientPackages([]));
  }, [clientId, sessionType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        providerId,
        clientId: sessionType === "group" ? null : (clientId || null),
        title,
        startTime,
        endTime,
        status,
        notes,
        sessionType,
        maxParticipants: sessionType === "group" ? maxParticipants : null,
        clientPackageId: sessionType === "individual" && selectedPackageId !== "none" ? selectedPackageId : null,
      };

      if (isEdit) {
        body.editScope = editScope;
      } else if (repeatEnabled) {
        body.recurrence = {
          frequency: recurrenceFreq,
          occurrences: parseInt(recurrenceOccurrences),
        };
      }

      const url = isEdit ? `/api/bookings/${event!.id}` : "/api/bookings";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!event || !isEdit) return;
    if (isSeries && !showScopeForDelete) {
      // Show scope selector for series delete
      setShowScopeForDelete(true);
      return;
    }
    const scopeLabel = editScope === "one" ? "this booking" : editScope === "this_and_future" ? "this and future bookings" : "all bookings in this series";
    if (!confirm(`Delete ${scopeLabel}?`)) return;
    setLoading(true);
    try {
      const deleteScope = isSeries ? editScope : "one";
      await fetch(`/api/bookings/${event.id}?deleteScope=${deleteScope}`, { method: "DELETE" });
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Booking" : "Book Session"}
            {isSeries && <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">Recurring series</span>}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Session type toggle */}
          {!isEdit && (
            <div className="flex rounded-lg border border-gray-200 p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => { setSessionType("individual"); setTitle("Session"); }}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${sessionType === "individual" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                1-to-1
              </button>
              <button
                type="button"
                onClick={() => { setSessionType("group"); setTitle("Group Session"); setClientId(""); setRepeatEnabled(false); }}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${sessionType === "group" ? "bg-teal-600 text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                Group
              </button>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={sessionType === "group" ? "e.g. Morning Yoga, HIIT Class" : "Session title"}
            />
          </div>

          {/* Individual: client selector */}
          {sessionType === "individual" && (
            <div className="space-y-1">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Individual: package deduction */}
          {sessionType === "individual" && clientPackages.length > 0 && (
            <div className="space-y-1">
              <Label>Deduct from Package</Label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select package (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No package</SelectItem>
                  {clientPackages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.packageName} — {p.sessionsRemaining} left
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Group: max participants */}
          {sessionType === "group" && (
            <div className="space-y-1">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="2"
                max="200"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400">Add clients to the session after creating it</p>
            </div>
          )}

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="startTime">Start</Label>
              <Input id="startTime" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endTime">End</Label>
              <Input id="endTime" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>

          {/* Recurrence (create mode, individual sessions only) */}
          {!isEdit && sessionType === "individual" && (
            <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={repeatEnabled}
                  onChange={(e) => setRepeatEnabled(e.target.checked)}
                  className="rounded h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-700">Repeat (create series)</span>
              </label>
              {repeatEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label>Frequency</Label>
                    <Select value={recurrenceFreq} onValueChange={(v) => setRecurrenceFreq(v as typeof recurrenceFreq)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="occurrences">Sessions</Label>
                    <Input
                      id="occurrences"
                      type="number"
                      min="2"
                      max="52"
                      value={recurrenceOccurrences}
                      onChange={(e) => setRecurrenceOccurrences(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status (edit only) */}
          {isEdit && (
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="capitalize">{s.replace("_", " ")}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Series edit scope (edit mode, series bookings only) */}
          {isEdit && isSeries && (
            <div className="space-y-1 rounded-lg border border-amber-100 bg-amber-50 p-3">
              <Label className="text-amber-800">Apply changes to</Label>
              <div className="flex flex-col gap-1.5 mt-1">
                {(["one", "this_and_future", "all"] as EditScope[]).map((scope) => (
                  <label key={scope} className="flex items-center gap-2 cursor-pointer text-sm text-amber-900">
                    <input
                      type="radio"
                      name="editScope"
                      value={scope}
                      checked={editScope === scope}
                      onChange={() => setEditScope(scope)}
                      className="h-4 w-4"
                    />
                    {scope === "one" && "Just this session"}
                    {scope === "this_and_future" && "This and future sessions"}
                    {scope === "all" && "All sessions in series"}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className={`flex-1 ${sessionType === "group" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
            >
              {loading
                ? "Saving…"
                : isEdit
                ? "Save Changes"
                : repeatEnabled
                ? `Create ${recurrenceOccurrences} Sessions`
                : sessionType === "group"
                ? "Create Group Session"
                : "Book Session"}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={loading}
                title={isSeries ? "Delete series booking(s)" : "Delete booking"}
              >
                ✕
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatForInput(d: Date) {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}
