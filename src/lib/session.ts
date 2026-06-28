import { auth } from "@/auth";

/** Returns the logged-in user's provider ID and email, or null if not authenticated. */
export async function getSession(): Promise<{ uid: string; email: string | null } | null> {
  const session = await getSafeSession();
  if (!session?.user?.id) return null;
  return { uid: session.user.id, email: session.user.email ?? null };
}

/** Like auth(), but returns null when the session JWT cannot be decrypted. */
export async function getSafeSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
