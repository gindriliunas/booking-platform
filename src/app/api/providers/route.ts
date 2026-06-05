import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { providerFields } from "@/lib/db/provider-fields";
import { eq } from "drizzle-orm";
import { requireAdminProvider } from "@/lib/auth-provider";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const authError = await requireAdminProvider(providerId);
  if (authError) return authError;

  const [provider] = await db
    .select(providerFields)
    .from(providers)
    .where(eq(providers.id, providerId));
  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    provider: {
      ...provider,
      googleCalendarAccessToken: undefined,
      googleCalendarRefreshToken: undefined,
    },
  });
}
