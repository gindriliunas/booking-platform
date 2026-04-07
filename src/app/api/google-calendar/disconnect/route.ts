import { NextRequest, NextResponse } from "next/server";
import { requireAdminProvider } from "@/lib/auth-provider";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { providerId } = await req.json();
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  await db
    .update(providers)
    .set({
      googleCalendarAccessToken: null,
      googleCalendarRefreshToken: null,
      googleCalendarTokenExpiresAt: null,
      googleCalendarId: null,
      googleCalendarSyncEnabled: false,
      updatedAt: new Date(),
    })
    .where(eq(providers.id, providerId));

  return NextResponse.json({ ok: true });
}
