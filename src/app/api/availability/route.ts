import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { availability } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const rows = await db
    .select()
    .from(availability)
    .where(eq(availability.providerId, providerId))
    .orderBy(availability.dayOfWeek);

  return NextResponse.json({ availability: rows });
}

// Replace the full weekly schedule atomically
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { providerId, slots } = body as {
    providerId: string;
    slots: { dayOfWeek: number; startTime: string; endTime: string }[];
  };

  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  // Delete existing rows then insert new ones
  await db.delete(availability).where(eq(availability.providerId, providerId));
  if (slots.length > 0) {
    await db.insert(availability).values(
      slots.map((s) => ({ providerId, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }))
    );
  }

  const rows = await db
    .select()
    .from(availability)
    .where(eq(availability.providerId, providerId))
    .orderBy(availability.dayOfWeek);

  return NextResponse.json({ availability: rows });
}
