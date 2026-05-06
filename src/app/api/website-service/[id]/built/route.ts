import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendClientPreviewEmail } from "@/lib/email/website-service";

const ADMIN_TOKEN = process.env.WEBSITE_SERVICE_ADMIN_TOKEN;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_TOKEN || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { vercelProjectId, previewUrl } = await req.json();
    if (!vercelProjectId || !previewUrl) {
      return NextResponse.json(
        { error: "vercelProjectId and previewUrl are required" },
        { status: 400 }
      );
    }

    const [client] = await db
      .update(websiteClients)
      .set({ vercelProjectId, previewUrl, status: "preview_live", updatedAt: new Date() })
      .where(eq(websiteClients.id, id))
      .returning();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    sendClientPreviewEmail({
      clientEmail: client.email,
      clientName: client.name,
      businessName: client.businessName,
      previewUrl: client.previewUrl!,
      websiteClientId: client.id,
    }).catch((err) => console.error("[website-service] Preview email failed:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/website-service/[id]/built error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
