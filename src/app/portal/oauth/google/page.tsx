"use client";

import { useEffect, useRef, useState } from "react";
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

/** Full-window page (not inside an iframe) so Google OAuth is allowed. Embedded portal links here with target="_top". */
export default function PortalGoogleOAuthPage() {
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not start Google sign-in.");
      }
    })();
  }, []);

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
