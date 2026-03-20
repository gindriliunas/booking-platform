import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/book(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/ghl(.*)",
  "/api/book(.*)",
  "/api/slots(.*)",
  "/api/portal(.*)",
  "/api/group-sessions(.*)",
  "/api/providers$",
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
