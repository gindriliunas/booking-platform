import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adClicks } from "@/lib/db/schema";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (id) {
      await db.insert(adClicks).values({ partnerSpotId: id });
    }
  } catch {
    // never break the client site
  }
  return new NextResponse(null, { status: 204, headers: CORS });
}
