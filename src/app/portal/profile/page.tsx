"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface ClientProfile {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export default function PortalProfilePage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/portal/me")
      .then(async (r) => {
        const text = await r.text();
        if (!text) return;
        const d = JSON.parse(text);
        if (d.client) {
          setProfile(d.client);
          setName(d.client.name ?? "");
          setPhone(d.client.phone ?? "");
        } else if (d.email) {
          setSignedInEmail(d.email);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500 py-8">Loading…</div>;
  if (!profile) return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 max-w-md space-y-2">
      <p className="text-sm font-medium text-amber-900">No client account linked</p>
      {signedInEmail ? (
        <p className="text-sm text-amber-700">
          You&apos;re signed in as <strong>{signedInEmail}</strong>. Ask your provider to add a client record with this email address.
        </p>
      ) : (
        <p className="text-sm text-amber-700">Please contact your provider to get access set up.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* Personal details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="profileName">Full name</Label>
              <Input
                id="profileName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="profileEmail">Email</Label>
              <Input
                id="profileEmail"
                value={profile.email ?? ""}
                disabled
                className="bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400">Email is managed via your sign-in account.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="profilePhone">Phone</Label>
              <Input
                id="profilePhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 000000"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {saved && <p className="text-sm text-green-600">Changes saved.</p>}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
