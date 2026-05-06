import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

const ADMIN_TOKEN = process.env.WEBSITE_SERVICE_ADMIN_TOKEN;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_TOKEN || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clients = await db
      .select()
      .from(websiteClients)
      .orderBy(desc(websiteClients.createdAt));

    return NextResponse.json(clients);
  } catch (err) {
    console.error("GET /api/website-service error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
