"use client";

import { useEffect, useRef } from "react";
import { getRedirectResult } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";

/**
 * Completes Google sign-in after signInWithRedirect (iframe or mobile).
 * Lives in the portal layout so it runs on whatever URL Firebase returns to,
 * and without aborting the async flow on React effect cleanup (fixes stuck sign-in).
 */
export function PortalFirebaseRedirectHandler() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result?.user) return;
        const idToken = await result.user.getIdToken();
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken }),
        });
        if (!res.ok) throw new Error("Session creation failed");
        router.replace("/portal");
        router.refresh();
      } catch (e) {
        console.error("PortalFirebaseRedirectHandler", e);
      }
    })();
  }, [router]);

  return null;
}
