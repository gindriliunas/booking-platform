import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blockedTimes } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const { providerId, title, startTime, endTime } = await req.json();
  if (!providerId || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [blocked] = await db
    .insert(blockedTimes)
    .values({
      providerId,
      title: title ?? "Blocked",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    })
    .returning();

  return NextResponse.json({ blocked }, { status: 201 });
}
