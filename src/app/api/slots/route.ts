import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  const dateStr = req.nextUrl.searchParams.get("date"); // "yyyy-MM-dd"

  if (!providerId || !dateStr) {
    return NextResponse.json({ error: "providerId and date required" }, { status: 400 });
  }

  const date = new Date(`${dateStr}T00:00:00`);
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const slots = await getAvailableSlots(providerId, date);

  return NextResponse.json({
    slots: slots.map((s) => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
      label: s.label,
    })),
  });
}
