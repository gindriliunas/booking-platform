"use client";

import { useState, useRef } from "react";
import { Pencil, Trash2, Plus, X, Loader2, Building2, ExternalLink, ImageIcon } from "lucide-react";
import { upsertPartnerSpot, clearPartnerSpot } from "./actions";

type Spot = {
  id: string;
  position: number;
  businessName: string;
  logoUrl: string | null;
  description: string;
  visitUrl: string;
  clicks: number;
};

export function PartnerSpotsManager({ spots }: { spots: Spot[] }) {
  const spotMap = new Map(spots.map((s) => [s.position, s]));
  const positions = [1, 2, 3, 4];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {positions.map((pos) => {
        const spot = spotMap.get(pos);
        return spot ? (
          <FilledSlot key={pos} spot={spot} />
        ) : (
          <EmptySlot key={pos} position={pos} />
        );
      })}
    </div>
  );
}

function FilledSlot({ spot }: { spot: Spot }) {
  const [editing, setEditing] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleClear() {
    setClearing(true);
    await clearPartnerSpot(spot.position);
    setClearing(false);
  }

  return (
    <>
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-300">
            Slot {spot.position}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleClear}
              disabled={clearing}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Remove"
            >
              {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Logo or fallback */}
        <div className="h-12 flex items-center">
          {spot.logoUrl ? (
            <img src={spot.logoUrl} alt={spot.businessName} className="max-h-12 max-w-full object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-300" />
              <span className="font-semibold text-gray-700 text-sm">{spot.businessName}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 leading-relaxed flex-1">{spot.description}</p>

        <div className="flex items-center justify-between">
          <a
            href={spot.visitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Visit <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-xs text-gray-400 tabular-nums">
            {spot.clicks.toLocaleString()} click{spot.clicks !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {editing && (
        <SpotFormModal
          position={spot.position}
          initial={spot}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

function EmptySlot({ position }: { position: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-indigo-300 hover:text-indigo-400 transition-colors min-h-[180px]"
      >
        <Plus className="h-6 w-6" />
        <span className="text-xs font-medium">Slot {position} — empty</span>
      </button>

      {open && (
        <SpotFormModal position={position} initial={null} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function SpotFormModal({
  position,
  initial,
  onClose,
}: {
  position: number;
  initial: Spot | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>(initial?.logoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-logo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setLogoUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("position", String(position));
    fd.set("logoUrl", logoUrl);
    try {
      await upsertPartnerSpot(fd);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">
            {initial ? "Edit" : "Add"} partner — Slot {position}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field
            label="Business name *"
            name="businessName"
            placeholder="Acme Fitness"
            defaultValue={initial?.businessName}
            required
          />

          {/* Logo upload */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Logo</label>
            <div className="flex items-center gap-3">
              {/* Preview */}
              <div className="flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="logo preview" className="max-h-14 max-w-[88px] object-contain" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-gray-300" />
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {uploading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
                  ) : (
                    "Upload image"
                  )}
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="text-xs text-red-400 hover:text-red-600 text-left"
                  >
                    Remove logo
                  </button>
                )}
                <p className="text-[11px] text-gray-300">PNG, JPG, SVG, WebP — max 512 KB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Short description *</label>
            <textarea
              name="description"
              rows={3}
              required
              placeholder="A short, compelling description of this business..."
              defaultValue={initial?.description}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          <Field
            label="Visit URL *"
            name="visitUrl"
            placeholder="https://acmefitness.com"
            defaultValue={initial?.visitUrl}
            required
          />

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    </div>
  );
}
