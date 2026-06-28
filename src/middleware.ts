import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = [
  /^\/$/,
  /^\/sign-in(\/.*)?$/,
  /^\/sign-up(\/.*)?$/,
  /^\/auth\/error$/,
  /^\/portal(\/.*)?$/,
  /^\/api\/portal(\/.*)?$/,
  /^\/api\/group-sessions(\/.*)?$/,
  /^\/api\/auth(\/.*)?$/,
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((r) => r.test(pathname));
}

export default auth((req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  if (!req.auth && !isPublicRoute(req.nextUrl.pathname)) {
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = "/";
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
