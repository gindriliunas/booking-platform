"use client";

import { useEffect, useState } from "react";
import { getRedirectResult, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";

/** Prevents React Strict Mode double-invoke from starting two redirects in dev. */
let oauthGoogleFlowStarted = false;

/** Full-window page (not inside an iframe) so Google OAuth is allowed. Embedded portal links here with target="_top". */
export default function PortalGoogleOAuthPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (oauthGoogleFlowStarted) return;
    oauthGoogleFlowStarted = true;

    void (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
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
          return;
        }
        await signInWithRedirect(auth, new GoogleAuthProvider());
      } catch (e) {
        oauthGoogleFlowStarted = false;
        setError(e instanceof Error ? e.message : "Could not complete Google sign-in.");
      }
    })();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 bg-gray-50 p-6">
        <p className="text-center text-sm text-red-700">{error}</p>
        <a href="/portal/sign-in" className="text-sm font-medium text-indigo-600 underline">
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 bg-gray-50 p-6">
      <p className="text-sm text-gray-600">Connecting to Google…</p>
    </div>
  );
}
