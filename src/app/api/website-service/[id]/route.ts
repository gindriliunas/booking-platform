import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_TOKEN = process.env.WEBSITE_SERVICE_ADMIN_TOKEN;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_TOKEN || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const allowed = ["notes", "status", "vercelProjectId", "previewUrl", "customDomain"] as const;
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const [client] = await db
      .update(websiteClients)
      .set(updates)
      .where(eq(websiteClients.id, params.id))
      .returning();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (err) {
    console.error("PATCH /api/website-service/[id] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [client] = await db
      .select()
      .from(websiteClients)
      .where(eq(websiteClients.id, params.id));

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (err) {
    console.error("GET /api/website-service/[id] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
