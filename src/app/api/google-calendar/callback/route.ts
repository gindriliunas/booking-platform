import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const providerId = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const settingsUrl = `${appUrl}/settings`;

  if (error || !code || !providerId) {
    return NextResponse.redirect(`${settingsUrl}?gcal_error=access_denied`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${settingsUrl}?gcal_error=not_configured`);
  }

  const redirectUri = `${appUrl}/api/google-calendar/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${settingsUrl}?gcal_error=token_exchange_failed`);
  }

  const tokenData = await tokenRes.json();
  const { access_token, refresh_token, expires_in } = tokenData;

  const expiresAt = new Date(Date.now() + expires_in * 1000);

  await db
    .update(providers)
    .set({
      googleCalendarAccessToken: access_token,
      googleCalendarRefreshToken: refresh_token ?? null,
      googleCalendarTokenExpiresAt: expiresAt,
      googleCalendarSyncEnabled: true,
      updatedAt: new Date(),
    })
    .where(eq(providers.id, providerId));

  return NextResponse.redirect(`${settingsUrl}?gcal_connected=1`);
}
