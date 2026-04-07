import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function maskKey(key: string | null | undefined) {
  if (!key) return null;
  return key.slice(0, 8) + "••••••••" + key.slice(-4);
}

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const [provider] = await db.select().from(providers).where(eq(providers.id, providerId));
  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Never send raw secret keys to the client
  return NextResponse.json({
    provider: {
      ...provider,
      stripeSecretKey: undefined,
      stripeWebhookSecret: undefined,
      googleCalendarAccessToken: undefined,
      googleCalendarRefreshToken: undefined,
      stripeSecretKeyMasked: maskKey(provider.stripeSecretKey),
      stripeWebhookSecretMasked: maskKey(provider.stripeWebhookSecret),
      stripeConfigured: !!provider.stripeSecretKey,
    },
  });
}
