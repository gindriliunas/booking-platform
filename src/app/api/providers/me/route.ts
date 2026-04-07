import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function maskKey(key: string | null | undefined) {
  if (!key) return null;
  return key.slice(0, 8) + "••••••••" + key.slice(-4);
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.clerkUserId, userId));

    if (!provider) return NextResponse.json({ provider: null }, { status: 200 });

    return NextResponse.json({
      provider: {
        ...provider,
        stripeSecretKey: undefined,
        stripeWebhookSecret: undefined,
        stripeSecretKeyMasked: maskKey(provider.stripeSecretKey),
        stripeWebhookSecretMasked: maskKey(provider.stripeWebhookSecret),
        stripeConfigured: !!provider.stripeSecretKey,
      },
    });
  } catch (err) {
    console.error("[GET /api/providers/me]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [existing] = await db
    .select({ id: providers.id })
    .from(providers)
    .where(eq(providers.clerkUserId, userId));
  if (existing) return NextResponse.json({ error: "Provider already exists" }, { status: 409 });

  const body = await req.json();
  const { name, serviceType, timezone, sessionDurationMins, currency } = body;
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const [provider] = await db
    .insert(providers)
    .values({
      name,
      serviceType: serviceType || null,
      timezone: timezone || "UTC",
      sessionDurationMins: sessionDurationMins || 60,
      currency: currency || "usd",
      clerkUserId: userId,
    })
    .returning();

  return NextResponse.json({ provider }, { status: 201 });
}
