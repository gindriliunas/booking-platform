import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/auth-constants";

const SESSION_DURATION_MS = 60 * 60 * 24 * 14 * 1000; // 14 days

/** Verify the session cookie and return the Firebase UID, or null. */
export async function getSession(): Promise<{ uid: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

/** Create a session cookie from a Firebase ID token. Call from the /api/auth/session route. */
export async function createSession(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });
}

export { SESSION_COOKIE } from "@/lib/auth-constants";
