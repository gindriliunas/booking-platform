import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { packages } from "@/lib/db/schema";
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
      .from(packages)
      .where(eq(packages.providerId, providerId))
      .orderBy(packages.sessionCount);

    return NextResponse.json({ packages: rows });
  } catch (err) {
    console.error("GET /api/packages error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    providerId,
    name,
    description,
    sessionCount,
    sessionDurationMins,
    price,
    currency,
    validityDays,
    sessionType,
    isPublic,
    isFreeTrialSession,
    allowSelfBook,
  } = body;

  if (!providerId || !name || !sessionCount || price === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  try {
    const [pkg] = await db
      .insert(packages)
      .values({
        providerId,
        name,
        description: description ?? null,
        sessionCount: parseInt(sessionCount),
        sessionDurationMins: sessionDurationMins ? parseInt(sessionDurationMins) : null,
        price: parseFloat(price).toFixed(2),
        currency: currency ?? "usd",
        validityDays: validityDays ? parseInt(validityDays) : null,
        sessionType: sessionType ?? "individual",
        isPublic: isPublic ?? true,
        isFreeTrialSession: isFreeTrialSession ?? false,
        allowSelfBook: allowSelfBook ?? true,
      })
      .returning();

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (err) {
    console.error("POST /api/packages db error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
