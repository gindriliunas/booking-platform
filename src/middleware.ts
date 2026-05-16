import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-constants";

const PUBLIC_ROUTES = [
  /^\/$/,
  /^\/terms(\/.*)?$/,
  /^\/privacy(\/.*)?$/,
  /^\/portal(\/.*)?$/,
  /^\/sign-in(\/.*)?$/,
  /^\/sign-up(\/.*)?$/,
  /^\/pay(\/.*)?$/,
  /^\/api\/connect(\/.*)?$/,
  /^\/api\/portal(\/.*)?$/,
  /^\/api\/group-sessions(\/.*)?$/,
  /^\/api\/providers$/,
  /^\/api\/stripe\/webhook(\/.*)?$/,
  /^\/api\/auth(\/.*)?$/,
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((r) => r.test(pathname));
}

export default async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") ?? "";
  if (hostname === "book.viv-z.com" && !req.nextUrl.pathname.startsWith("/portal") && !req.nextUrl.pathname.startsWith("/api/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/portal" + (req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname);
    return NextResponse.rewrite(url);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  if (!isPublicRoute(req.nextUrl.pathname)) {
    const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionCookie) {
      const signInUrl = req.nextUrl.clone();
      signInUrl.pathname = "/sign-in";
      return NextResponse.redirect(signInUrl);
    }
    // Full token verification happens in server components/API routes via getSession().
    // Middleware only checks presence to avoid Firebase Admin cold-start latency on every edge request.
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
