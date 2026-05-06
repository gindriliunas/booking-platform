import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { addDomainToVercelProject } from "@/lib/vercel-api";

const ADMIN_TOKEN = process.env.WEBSITE_SERVICE_ADMIN_TOKEN;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_TOKEN || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { domain } = await req.json();
    if (!domain) {
      return NextResponse.json({ error: "domain is required" }, { status: 400 });
    }

    const [client] = await db
      .select()
      .from(websiteClients)
      .where(eq(websiteClients.id, params.id));

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.vercelProjectId) {
      return NextResponse.json({ error: "No Vercel project linked" }, { status: 400 });
    }

    const result = await addDomainToVercelProject(client.vercelProjectId, domain);

    await db
      .update(websiteClients)
      .set({ customDomain: domain, updatedAt: new Date() })
      .where(eq(websiteClients.id, client.id));

    return NextResponse.json({ ok: true, vercel: result });
  } catch (err) {
    console.error("POST /api/website-service/[id]/domain error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
