"use client";

import { signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

function hasSessionCookie() {
  return document.cookie.split(";").some((part) => {
    const name = part.trim().split("=")[0];
    return (
      name === "authjs.session-token" ||
      name.startsWith("authjs.session-token.") ||
      name === "__Secure-authjs.session-token" ||
      name.startsWith("__Secure-authjs.session-token.") ||
      name === "next-auth.session-token"
    );
  });
}

/**
 * Removes a session cookie that cannot be decrypted (e.g. after AUTH_SECRET changed).
 * Prevents JWTSessionError noise on every request until the user clears cookies manually.
 */
export function ClearStaleSession() {
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current || !hasSessionCookie()) return;
    cleared.current = true;
    void signOut({ redirect: false });
  }, []);

  return null;
}
