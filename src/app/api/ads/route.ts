import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partnerSpots } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  const spots = await db
    .select({
      id: partnerSpots.id,
      position: partnerSpots.position,
      businessName: partnerSpots.businessName,
      logoUrl: partnerSpots.logoUrl,
      description: partnerSpots.description,
      visitUrl: partnerSpots.visitUrl,
    })
    .from(partnerSpots)
    .where(eq(partnerSpots.isActive, true))
    .orderBy(asc(partnerSpots.position));

  return NextResponse.json(spots, { headers: CORS });
}
