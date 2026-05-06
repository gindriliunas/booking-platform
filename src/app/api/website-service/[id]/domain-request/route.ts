import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@vivz.co.uk";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "g.indriliunas@gmail.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.vivz.co.uk";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { domain } = await req.json();
    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "domain is required" }, { status: 400 });
    }

    const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, "");

    const [client] = await db
      .select()
      .from(websiteClients)
      .where(eq(websiteClients.id, params.id));

    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (client.status !== "active") {
      return NextResponse.json({ error: "Subscription required" }, { status: 403 });
    }

    // Notify admin to wire the domain via Vercel API
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `🌐 Domain request — ${client.businessName}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111">
          <h2>Domain connection request</h2>
          <p><strong>${client.businessName}</strong> (${client.name}) wants to connect:</p>
          <p style="font-size:20px;font-weight:600;background:#f5f5f5;padding:12px 16px;border-radius:8px">${cleaned}</p>
          <p>Vercel project ID: <code>${client.vercelProjectId ?? "not set"}</code></p>
          <p>Run the following in your terminal or use the admin API:</p>
          <pre style="background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;font-size:12px">
curl -X POST ${APP_URL}/api/website-service/${client.id}/domain \\
  -H "Authorization: Bearer $WEBSITE_SERVICE_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"domain":"${cleaned}"}'
          </pre>
        </div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/website-service/[id]/domain-request error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
