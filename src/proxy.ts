import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/portal/sign-in(.*)",
  "/portal/sign-up(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/ghl(.*)",
  "/api/portal(.*)",
  "/api/group-sessions(.*)",
  "/api/providers",
  "/api/stripe/webhook(.*)",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
