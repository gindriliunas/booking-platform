"use client";

import { useEffect, useRef } from "react";
import { getRedirectResult } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";

/**
 * Completes Google sign-in after signInWithRedirect (e.g. mobile on /portal/sign-in).
 * `/portal/oauth/google` handles its own getRedirectResult — that page must not double-consume
 * the redirect or it would immediately call signInWithRedirect again (Google account loop).
 */
export function PortalFirebaseRedirectHandler() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const ran = useRef(false);

  useEffect(() => {
    if (pathname.startsWith("/portal/oauth/")) return;
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
  }, [router, pathname]);

  return null;
}
