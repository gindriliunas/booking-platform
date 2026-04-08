import { getSession } from "@/lib/session";
import { adminAuth } from "@/lib/firebase/admin";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

async function resolveProvider(uid: string) {
  // Fast path: already linked
  let [p] = await db.select({ id: providers.id }).from(providers).where(eq(providers.firebaseUid, uid));
  if (p) return p;

  // Migration path: link by email on first request
  const firebaseUser = await adminAuth.getUser(uid).catch(() => null);
  const email = firebaseUser?.email;
  if (!email) return null;

  const [byEmail] = await db.select({ id: providers.id }).from(providers).where(eq(providers.email, email));
  if (!byEmail) return null;

  await db.update(providers).set({ firebaseUid: uid }).where(eq(providers.id, byEmail.id));
  return byEmail;
}

export async function getAdminProviderId(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  const p = await resolveProvider(session.uid);
  return p?.id ?? null;
}

export async function requireAdminProvider(requestedProviderId?: string): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const p = await resolveProvider(session.uid);
  if (!p) return NextResponse.json({ error: "No provider found for this account" }, { status: 403 });
  if (requestedProviderId && requestedProviderId !== p.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
