import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

/** Resolve portal client by email (must match a client row for the signed-in provider). */
export async function getPortalClient(email: string | null | undefined) {
  if (!email) return null;
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.email, email.toLowerCase()));
  return client ?? null;
}

/** Client for provider portal: same email and belongs to this provider. */
export async function getPortalClientForProvider(
  email: string | null | undefined,
  providerId: string
) {
  if (!email) return null;
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.email, email.toLowerCase()), eq(clients.providerId, providerId)));
  return client ?? null;
}
