import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function getAdminProviderId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const [p] = await db
    .select({ id: providers.id })
    .from(providers)
    .where(eq(providers.clerkUserId, userId));
  return p?.id ?? null;
}

export async function requireAdminProvider(requestedProviderId?: string): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [p] = await db
    .select({ id: providers.id })
    .from(providers)
    .where(eq(providers.clerkUserId, userId));
  if (!p) return NextResponse.json({ error: "No provider found for this account" }, { status: 403 });
  if (requestedProviderId && requestedProviderId !== p.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
