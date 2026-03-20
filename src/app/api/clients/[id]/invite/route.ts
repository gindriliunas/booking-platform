import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { clients, providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminProviderId } from "@/lib/auth-provider";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const providerId = await getAdminProviderId();
  if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  if (!client.email) return NextResponse.json({ error: "Client has no email address" }, { status: 400 });

  const [provider] = await db.select().from(providers).where(eq(providers.id, providerId));
  const providerName = provider?.name ?? "Your provider";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yourapp.com";
  const portalUrl = `${appUrl}/portal/sign-up`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@yourapp.com",
    to: client.email,
    subject: `You've been invited to ${providerName}'s client portal`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Hi ${client.name},</h2>
        <p style="color:#555;line-height:1.6;margin-bottom:24px">
          ${providerName} has set up a client portal for you where you can view your sessions,
          complete questionnaires, and manage your bookings.
        </p>
        <a href="${portalUrl}"
           style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px">
          Access Your Portal
        </a>
        <p style="margin-top:24px;color:#888;font-size:13px;line-height:1.6">
          Sign up using this email address (${client.email}) and your account will be
          linked automatically.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
        <p style="color:#aaa;font-size:12px">Sent by ${providerName} via the client portal.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
