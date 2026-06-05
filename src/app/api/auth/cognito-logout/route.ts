import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/auth";
import { getAppBaseUrl, getCognitoLogoutUrl } from "@/lib/cognito";

export async function GET(req: NextRequest) {
  const fallback = getAppBaseUrl();
  const redirectUri =
    req.nextUrl.searchParams.get("redirect_uri") ?? fallback;

  await signOut({ redirect: false });

  const cognitoLogout = getCognitoLogoutUrl(redirectUri);
  if (cognitoLogout) {
    return NextResponse.redirect(cognitoLogout);
  }

  return NextResponse.redirect(redirectUri);
}
