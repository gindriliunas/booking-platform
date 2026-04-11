/** Full-page route that starts Google sign-in outside the embed (see portal/oauth/google). */
export const PORTAL_GOOGLE_OAUTH_PATH = "/portal/oauth/google";

/**
 * Google OAuth cannot run inside cross-origin iframes (Google blocks it).
 * This helper detects whether the page is embedded.
 */
export function isEmbeddedInIframe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
