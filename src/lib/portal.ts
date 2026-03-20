import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getPortalClient(userId: string) {
  // Fast path: already linked by clerkUserId
  let [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.clerkUserId, userId));
  if (client) return client;

  // First sign-in: try to link by email
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;
  if (!email) return null;

  const [matched] = await db
    .select()
    .from(clients)
    .where(eq(clients.email, email));
  if (!matched) return null;

  // Link the Clerk user ID to the client record (one-time write)
  const [linked] = await db
    .update(clients)
    .set({ clerkUserId: userId, updatedAt: new Date() })
    .where(eq(clients.id, matched.id))
    .returning();
  return linked;
}
