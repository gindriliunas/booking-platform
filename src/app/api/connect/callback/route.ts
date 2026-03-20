import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { installations, providers } from "@/lib/db/schema";
import { exchangeCodeForTokens, getLocation } from "@/lib/ghl/client";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const locationId = searchParams.get("locationId") ?? searchParams.get("location_id");

  if (!code) {
    return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const ghlLocationId = tokens.locationId ?? locationId ?? "";
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Upsert installation
    const existing = await db
      .select()
      .from(installations)
      .where(eq(installations.locationId, ghlLocationId));

    let installId: string;
    if (existing.length > 0) {
      await db
        .update(installations)
        .set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(installations.locationId, ghlLocationId));
      installId = existing[0].id;
    } else {
      const [install] = await db
        .insert(installations)
        .values({
          locationId: ghlLocationId,
          companyId: tokens.companyId ?? null,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: expiresAt,
        })
        .returning();
      installId = install.id;

      // Fetch location name for the provider profile
      let locationName = "My Practice";
      try {
        const loc = await getLocation(ghlLocationId, tokens.access_token);
        locationName = loc?.location?.name ?? locationName;
      } catch {}

      // Create default provider profile
      await db.insert(providers).values({
        installationId: installId,
        name: locationName,
        timezone: "UTC",
      });
    }

    // Redirect to dashboard inside GHL iframe
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/dashboard?locationId=${ghlLocationId}`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.json(
      { error: "OAuth callback failed", details: String(err) },
      { status: 500 }
    );
  }
}
