import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicPortalRoute = createRouteMatcher([
  "/portal/sign-in(.*)",
  "/portal/sign-up(.*)",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const isPortal = req.nextUrl.pathname.startsWith("/portal");
  if (isPortal && !isPublicPortalRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/portal(.*)", "/api/portal(.*)"],
};
