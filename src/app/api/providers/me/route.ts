import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { resolveProviderId } from "@/lib/resolve-provider";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { providerFields } from "@/lib/db/provider-fields";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const providerId = await resolveProviderId(session);
    if (!providerId) return NextResponse.json({ provider: null }, { status: 200 });

    const [provider] = await db
      .select(providerFields)
      .from(providers)
      .where(eq(providers.id, providerId));

    if (!provider) return NextResponse.json({ provider: null }, { status: 200 });

    return NextResponse.json({ provider });
  } catch (err) {
    console.error("[GET /api/providers/me]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existingId = await resolveProviderId(session);
  if (existingId) {
    return NextResponse.json({ error: "Provider already exists" }, { status: 409 });
  }

  const body = await req.json();
  const { name, serviceType, timezone, sessionDurationMins, currency } = body;
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const [provider] = await db
    .insert(providers)
    .values({
      id: session.uid,
      name,
      serviceType: serviceType || null,
      timezone: timezone || "UTC",
      sessionDurationMins: sessionDurationMins || 60,
      currency: currency || "usd",
      email: session.email,
    })
    .returning(providerFields);

  return NextResponse.json({ provider }, { status: 201 });
}
