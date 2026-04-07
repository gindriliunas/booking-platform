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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CalendarEvent } from "./session-calendar";

interface Participant {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  clientPackageId: string | null;
  clientSubscriptionId: string | null;
  status: "booked" | "cancelled";
  joinedAt: string;
}

interface GroupPackage {
  id: string;
  packageName: string;
  sessionsRemaining: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  clients: { id: string; name: string; email?: string | null }[];
  onSuccess: () => void;
}

const STATUS_OPTIONS = ["scheduled", "completed", "cancelled", "no_show"] as const;
type EditScope = "one" | "this_and_future" | "all";

export function GroupSessionDialog({
  open,
  onOpenChange,
  event,
  clients,
  onSuccess,
}: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Edit fields
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Series edit/delete scope
  const [editScope, setEditScope] = useState<EditScope>("one");
  const [showScopeForDelete, setShowScopeForDelete] = useState(false);

  // Add participant
  const [addClientId, setAddClientId] = useState("none");
  const [addPackageId, setAddPackageId] = useState("none");
  const [clientGroupPackages, setClientGroupPackages] = useState<GroupPackage[]>([]);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Load session details and participants when dialog opens
  useEffect(() => {
    if (!open || !event) return;
    setTitle(event.title ?? "Group Session");
    setStartTime(formatForInput(event.start));
    setEndTime(formatForInput(event.end));
    setMaxParticipants(String(event.maxParticipants ?? 10));
    setStatus(event.status ?? "scheduled");
    setNotes((event as any).notes ?? "");
    setSaveError("");
    setAddError("");
    setAddClientId("none");
    setAddPackageId("none");
    setEditScope("one");
    setShowScopeForDelete(false);
    loadParticipants();
  }, [open, event]);

  async function loadParticipants() {
    if (!event) return;
    setLoadingParticipants(true);
    try {
      const res = await fetch(`/api/group-sessions/${event.id}/participants`);
      const data = await res.json();
      setParticipants(data.participants ?? []);
    } finally {
      setLoadingParticipants(false);
    }
  }

  // Load group packages when add-client changes
  useEffect(() => {
    if (addClientId === "none") { setClientGroupPackages([]); setAddPackageId("none"); return; }
    fetch(`/api/clients/${addClientId}/packages?sessionType=group`)
      .then((r) => r.json())
      .then((data) => setClientGroupPackages(data.packages ?? []))
      .catch(() => setClientGroupPackages([]));
    setAddPackageId("none");
  }, [addClientId]);

  const isSeries = !!event?.bookingSeriesId;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setSaving(true);
    setSaveError("");
    try {
      const body: Record<string, unknown> = { title, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString(), maxParticipants, status, notes };
      if (isSeries) body.editScope = editScope;
      const res = await fetch(`/api/group-sessions/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
      onSuccess();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    if (isSeries && !showScopeForDelete) {
      setShowScopeForDelete(true);
      return;
    }
    const scopeLabel =
      editScope === "one"
        ? "this session"
        : editScope === "this_and_future"
        ? "this and future sessions"
        : "all sessions in this series";
    if (!confirm(`Delete ${scopeLabel}? All participants will be removed and sessions restored.`)) return;
    setSaving(true);
    try {
      const deleteScope = isSeries ? editScope : "one";
      await fetch(`/api/bookings/${event.id}?deleteScope=${deleteScope}`, { method: "DELETE" });
      onSuccess();
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkAllComplete() {
    if (!event) return;
    if (!confirm("Mark all booked participants as completed?")) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { status: "completed" };
      if (isSeries) body.editScope = editScope;
      const res = await fetch(`/api/group-sessions/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setStatus("completed");
      onSuccess();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddParticipant() {
    if (!event || addClientId === "none") return;
    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch(`/api/group-sessions/${event.id}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: addClientId,
          clientPackageId: addPackageId !== "none" ? addPackageId : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to add participant");
      setAddClientId("none");
      setAddPackageId("none");
      await loadParticipants();
      onSuccess();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleCancelParticipant(participantId: string) {
    if (!event) return;
    setSaving(true);
    try {
      await fetch(`/api/group-sessions/${event.id}/participants/${participantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      await loadParticipants();
      onSuccess();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveParticipant(participantId: string) {
    if (!event) return;
    if (!confirm("Remove this participant? Their session credit will be restored.")) return;
    setSaving(true);
    try {
      await fetch(`/api/group-sessions/${event.id}/participants/${participantId}`, {
        method: "DELETE",
      });
      await loadParticipants();
      onSuccess();
    } finally {
      setSaving(false);
    }
  }

  const booked = participants.filter((p) => p.status === "booked");
  const max = parseInt(maxParticipants) || 0;
  const spotsLeft = max - booked.length;

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <DialogTitle className="text-lg">
              {title || "Group Session"}
              {isSeries && (
                <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                  Recurring series
                </span>
              )}
            </DialogTitle>
            <Badge
              className={
                spotsLeft <= 0
                  ? "bg-red-100 text-red-700 border-red-200 shrink-0"
                  : "bg-teal-100 text-teal-700 border-teal-200 shrink-0"
              }
            >
              {booked.length}/{max} spots
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(event.start, "EEE d MMM yyyy, HH:mm")} – {format(event.end, "HH:mm")}
          </p>
        </DialogHeader>

        {/* Edit form */}
        <form onSubmit={handleSave} className="space-y-3 border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <Label htmlFor="gs-title">Title</Label>
            <Input
              id="gs-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Yoga"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="gs-start">Start</Label>
              <Input
                id="gs-start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gs-end">End</Label>
              <Input
                id="gs-end"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="gs-max">Max Participants</Label>
              <Input
                id="gs-max"
                type="number"
                min={booked.length || 1}
                max="200"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="capitalize">{s.replace("_", " ")}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="gs-notes">Notes</Label>
            <textarea
              id="gs-notes"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
            />
          </div>

          {/* Series edit scope */}
          {isSeries && (
            <div className="space-y-1 rounded-lg border border-amber-100 bg-amber-50 p-3">
              <Label className="text-amber-800">Apply changes to</Label>
              <div className="flex flex-col gap-1.5 mt-1">
                {(["one", "this_and_future", "all"] as EditScope[]).map((scope) => (
                  <label key={scope} className="flex items-center gap-2 cursor-pointer text-sm text-amber-900">
                    <input
                      type="radio"
                      name="gsEditScope"
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

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1 bg-teal-600 hover:bg-teal-700">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            {status === "scheduled" && booked.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={handleMarkAllComplete}
                disabled={saving}
              >
                Mark All Complete
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={saving}
              title="Delete session"
            >
              ✕
            </Button>
          </div>
        </form>

        {/* Participant list */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Participants ({booked.length})
          </h3>

          {loadingParticipants ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : participants.length === 0 ? (
            <p className="text-sm text-gray-400">No participants yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                    p.status === "cancelled"
                      ? "border-gray-100 bg-gray-50 text-gray-400"
                      : "border-teal-100 bg-teal-50"
                  }`}
                >
                  <div>
                    <span className="font-medium">{p.clientName}</span>
                    {p.clientEmail && (
                      <span className="ml-2 text-gray-500 text-xs">{p.clientEmail}</span>
                    )}
                    {p.clientPackageId && (
                      <span className="ml-2 text-xs text-teal-600 bg-teal-100 rounded px-1 py-0.5">
                        package
                      </span>
                    )}
                    {p.clientSubscriptionId && (
                      <span className="ml-2 text-xs text-indigo-600 bg-indigo-100 rounded px-1 py-0.5">
                        subscription
                      </span>
                    )}
                    {p.status === "cancelled" && (
                      <span className="ml-2 text-xs text-red-500">cancelled</span>
                    )}
                  </div>
                  {p.status === "booked" && (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => handleCancelParticipant(p.id)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveParticipant(p.id)}
                        disabled={saving}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Add participant */}
          {spotsLeft > 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Add Participant</p>
              <Select value={addClientId} onValueChange={setAddClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients
                    .filter((c) => !participants.some((p) => p.clientId === c.id && p.status === "booked"))
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {addClientId !== "none" && (
                <Select value={addPackageId} onValueChange={setAddPackageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Deduct from group package (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No package (cash / offline)</SelectItem>
                    {clientGroupPackages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.packageName} — {p.sessionsRemaining} left
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {addError && <p className="text-xs text-red-600">{addError}</p>}

              <Button
                type="button"
                size="sm"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={addClientId === "none" || addLoading}
                onClick={handleAddParticipant}
              >
                {addLoading ? "Adding…" : "Add to Session"}
              </Button>
            </div>
          )}

          {spotsLeft <= 0 && (
            <p className="text-xs text-center text-red-500">Session is full ({max}/{max})</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatForInput(d: Date) {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}
