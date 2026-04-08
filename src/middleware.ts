import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
  const hostname = req.headers.get("host") ?? "";
  if (hostname === "book.viv-z.com" && !req.nextUrl.pathname.startsWith("/portal")) {
    const url = req.nextUrl.clone();
    url.pathname = "/portal" + (req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname);
    return NextResponse.rewrite(url);
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
