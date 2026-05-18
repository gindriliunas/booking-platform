import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";

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
    const body = await req.json();
    const siteId = body?.s as string | undefined;
    const path = (body?.p as string) || "/";
    const referrer = (body?.r as string) || null;

    if (!siteId) return new NextResponse(null, { status: 400, headers: CORS });

    const country =
      req.headers.get("x-vercel-ip-country") ??
      req.headers.get("cf-ipcountry") ??
      null;

    await db.insert(pageViews).values({
      websiteClientId: siteId,
      path: path.slice(0, 500),
      referrer: referrer ? referrer.slice(0, 500) : null,
      country,
    });
  } catch {
    // always return success — tracking must never break the client site
  }
  return new NextResponse(null, { status: 204, headers: CORS });
}
