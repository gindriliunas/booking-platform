/**
 * Token management — fetch a valid (possibly refreshed) access token
 * for a given installation.
 */
import { db } from "@/lib/db";
import { installations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { refreshAccessToken } from "./client";

export async function getValidToken(locationId: string): Promise<string> {
  const [install] = await db
    .select()
    .from(installations)
    .where(eq(installations.locationId, locationId));

  if (!install) throw new Error(`No installation found for location ${locationId}`);

  // If token expires in less than 5 minutes, refresh it
  const expiresIn = install.tokenExpiresAt.getTime() - Date.now();
  if (expiresIn < 5 * 60 * 1000) {
    const tokens = await refreshAccessToken(install.refreshToken);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    await db
      .update(installations)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(installations.locationId, locationId));
    return tokens.access_token;
  }

  return install.accessToken;
}
