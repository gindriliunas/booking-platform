"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { createWebsiteClient, updateWebsiteClient, deleteWebsiteClient } from "./actions";

type WebsiteClient = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  businessName: string;
  businessType: string;
  status: string;
  previewUrl: string | null;
  customDomain: string | null;
  notes: string | null;
};

export function AddWebsiteClientButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Add website client
      </button>
      {open && <WebsiteClientModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function EditWebsiteClientButton({ client }: { client: WebsiteClient }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
        title="Edit"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      {open && <WebsiteClientModal initial={client} onClose={() => setOpen(false)} />}
    </>
  );
}

export function DeleteWebsiteClientButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteWebsiteClient(id);
    setLoading(false);
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirming(false)}>
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Delete website client?</h3>
          <p className="text-xs text-gray-400 mb-5">
            This will permanently delete <span className="font-medium text-gray-700">{name}</span> and all their traffic data. This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setConfirming(false)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      title="Delete"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function WebsiteClientModal({
  initial,
  onClose,
}: {
  initial?: WebsiteClient;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!initial;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      if (isEdit) {
        await updateWebsiteClient(initial.id, fd);
      } else {
        await createWebsiteClient(fd);
        formRef.current?.reset();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl mb-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">
            {isEdit ? "Edit website client" : "Add website client"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact name *" name="name" placeholder="Jane Smith" defaultValue={initial?.name} required />
            <Field label="Email *" name="email" type="email" placeholder="jane@acme.com" defaultValue={initial?.email} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Business name *" name="businessName" placeholder="Acme Studio" defaultValue={initial?.businessName} required />
            <Field label="Business type *" name="businessType" placeholder="Personal Trainer" defaultValue={initial?.businessType} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone" name="phone" placeholder="+44 7700 000000" defaultValue={initial?.phone ?? ""} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Status</label>
              <select
                name="status"
                defaultValue={initial?.status ?? "building"}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="building">Building</option>
                <option value="preview_live">Preview live</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Preview URL" name="previewUrl" placeholder="https://preview.vercel.app" defaultValue={initial?.previewUrl ?? ""} />
            <Field label="Custom domain" name="customDomain" placeholder="acme.com" defaultValue={initial?.customDomain ?? ""} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Any notes about this client..."
              defaultValue={initial?.notes ?? ""}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Saving..." : isEdit ? "Save changes" : "Save client"}
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
  type = "text",
  placeholder,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    </div>
  );
}
