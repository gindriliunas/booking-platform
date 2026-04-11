/**
 * Google OAuth cannot run inside most cross-origin iframes (Google blocks it),
 * and signInWithPopup is unreliable on mobile. These helpers pick a safe strategy.
 */
export function isEmbeddedInIframe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin parent: comparing to top throws
    return true;
  }
}

export function prefersGoogleRedirectOverPopup(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}
