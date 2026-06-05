import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptionPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminProvider } from "@/lib/auth-provider";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  try {
    const rows = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.providerId, providerId));

    return NextResponse.json({ plans: rows });
  } catch (err) {
    console.error("GET /api/subscriptions error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    providerId,
    name,
    description,
    sessionsPerPeriod,
    sessionDurationMins,
    billingPeriod,
    price,
    currency,
    sessionType,
    isPublic,
  } = body;

  if (!providerId || !name || !sessionsPerPeriod || !price || !billingPeriod) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  try {
    const [plan] = await db
      .insert(subscriptionPlans)
      .values({
        providerId,
        name,
        description: description ?? null,
        sessionsPerPeriod: parseInt(sessionsPerPeriod),
        sessionDurationMins: sessionDurationMins ? parseInt(sessionDurationMins) : null,
        billingPeriod,
        price: parseFloat(price).toFixed(2),
        currency: currency ?? "usd",
        sessionType: sessionType ?? "individual",
        isPublic: isPublic ?? true,
      })
      .returning();

    return NextResponse.json({ plan }, { status: 201 });
  } catch (err) {
    console.error("POST /api/subscriptions db error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
