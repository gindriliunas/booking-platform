import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/docs(.*)",
  "/support(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/getting-started(.*)",
  "/portal(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pay(.*)",
  "/api/connect(.*)",
  "/api/portal(.*)",
  "/api/group-sessions(.*)",
  "/api/providers",
  "/api/stripe/webhook(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
