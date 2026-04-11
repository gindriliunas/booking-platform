/** Minimal subset of `useRouter()` used after auth (avoids Next.js internal router types that vary by version). */
export interface PortalAppRouter {
  push: (href: string) => void;
  refresh: () => void;
}

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

/** After session cookie is set: full navigation in embeds so RSC + cookies apply reliably on mobile Safari. */
export function completePortalAuthNavigation(router: PortalAppRouter, redirectTo: string) {
  if (typeof window === "undefined") return;
  if (isEmbeddedInIframe()) {
    window.location.assign(`${window.location.origin}${redirectTo.startsWith("/") ? redirectTo : `/${redirectTo}`}`);
    return;
  }
  router.push(redirectTo);
  router.refresh();
}
