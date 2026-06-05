import { getSession } from "@/lib/session";
import { resolveProviderId } from "@/lib/resolve-provider";
import { NextResponse } from "next/server";

export async function getAdminProviderId(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  return resolveProviderId(session);
}

export async function requireAdminProvider(requestedProviderId?: string): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const providerId = await resolveProviderId(session);
  if (!providerId) {
    return NextResponse.json({ error: "No provider found for this account" }, { status: 403 });
  }

  if (requestedProviderId && requestedProviderId !== providerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
