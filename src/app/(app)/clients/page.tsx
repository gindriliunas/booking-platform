"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ClientDialog } from "@/components/clients/client-dialog";
import { useProvider } from "@/components/provider-context";

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  hasPendingForm?: boolean;
}

type StatusFilter = "all" | "active" | "inactive";

export default function ClientsPage() {
  const { providerId: PROVIDER_ID } = useProvider();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!PROVIDER_ID) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ providerId: PROVIDER_ID });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      setClients(data.clients ?? []);
    } finally {
      setLoading(false);
    }
  }, [PROVIDER_ID, statusFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  function handleSuccess() {
    setDialogOpen(false);
    setEditClient(null);
    fetchClients();
  }

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">{clients.length} {statusFilter !== "all" ? statusFilter : "total"}</p>
        </div>
        <Button onClick={() => { setEditClient(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search + filter row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
          {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Client list */}
      {loading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading clients…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-500 py-8 text-center">
          {search ? "No clients match your search." : `No ${statusFilter !== "all" ? statusFilter + " " : ""}clients yet.`}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <Card key={client.id} className={`hover:shadow-md transition-shadow ${!client.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-gray-900 hover:text-indigo-600 flex-1 min-w-0 truncate"
                  >
                    {client.name}
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    {!client.isActive && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        Inactive
                      </span>
                    )}
                    {client.hasPendingForm && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Form pending
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => { setEditClient(client); setDialogOpen(true); }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                {client.email && (
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                <div className="mt-3">
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClientDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditClient(null); }}
        providerId={PROVIDER_ID}
        client={editClient}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
