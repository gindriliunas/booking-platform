import { adminAuth } from "@/lib/firebase/admin";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getPortalClient(uid: string) {
  // Fast path: already linked by firebaseUid
  let [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.firebaseUid, uid));
  if (client) return client;

  // First sign-in: try to link by email from Firebase Auth
  const firebaseUser = await adminAuth.getUser(uid);
  const email = firebaseUser.email;
  if (!email) return null;

  const [matched] = await db
    .select()
    .from(clients)
    .where(eq(clients.email, email));
  if (!matched) return null;

  // Link the Firebase UID to the client record (one-time write)
  const [linked] = await db
    .update(clients)
    .set({ firebaseUid: uid, updatedAt: new Date() })
    .where(eq(clients.id, matched.id))
    .returning();
  return linked;
}
