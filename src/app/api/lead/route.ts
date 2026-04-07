import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const CHANNEL_LABELS: Record<string, string> = {
  wordOfMouth: "Word of mouth / referrals",
  social: "Instagram / Facebook",
  website: "Has a website",
  onlineBooking: "Has online booking",
  google: "On Google / GMB",
};

const BUSINESS_LABELS: Record<string, string> = {
  PT: "Personal Trainer",
  massage: "Massage Therapist",
  physio: "Physiotherapist",
  nutritionist: "Nutritionist / Dietitian",
  yoga: "Yoga / Pilates Instructor",
  other: "Other",
};

const SESSIONS_LABELS: Record<string, string> = {
  "1-5": "1–5 sessions/week",
  "6-10": "6–10 sessions/week",
  "11-20": "11–20 sessions/week",
  "20+": "20+ sessions/week",
};

const RATE_LABELS: Record<string, string> = {
  under30: "Under £30/session",
  "30-50": "£30–£50/session",
  "50-75": "£50–£75/session",
  "75-100": "£75–£100/session",
  over100: "Over £100/session",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      businessType,
      sessionsPerWeek,
      ratePerSession,
      currentChannels,
      results,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ownerEmail = process.env.OWNER_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? "hello@viv-z.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@viv-z.com";

    const channelList = (currentChannels as string[])
      .map((c) => CHANNEL_LABELS[c] ?? c)
      .join(", ") || "None selected";

    const fmt = (n: number) => `£${n.toLocaleString("en-GB")}`;

    await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      replyTo: email,
      subject: `New lead from calculator: ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
          <h1 style="font-size:22px;font-weight:800;margin:0 0 4px">New lead from the website calculator</h1>
          <p style="color:#888;font-size:13px;margin:0 0 28px">Submitted via the revenue calculator on viv-z.com</p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr style="background:#f9f9f9">
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#555;width:40%">Name</td>
              <td style="padding:10px 14px;font-size:14px;color:#111">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#555">Email</td>
              <td style="padding:10px 14px;font-size:14px"><a href="mailto:${email}" style="color:#059669">${email}</a></td>
            </tr>
            <tr style="background:#f9f9f9">
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#555">Phone</td>
              <td style="padding:10px 14px;font-size:14px;color:#111">${phone || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#555">Business type</td>
              <td style="padding:10px 14px;font-size:14px;color:#111">${BUSINESS_LABELS[businessType] ?? businessType ?? "Not selected"}</td>
            </tr>
          </table>

          <h2 style="font-size:16px;font-weight:700;margin:0 0 12px;color:#111">Their current situation</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr style="background:#f9f9f9">
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#555;width:40%">Sessions/week</td>
              <td style="padding:10px 14px;font-size:14px;color:#111">${SESSIONS_LABELS[sessionsPerWeek] ?? sessionsPerWeek ?? "—"}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#555">Session rate</td>
              <td style="padding:10px 14px;font-size:14px;color:#111">${RATE_LABELS[ratePerSession] ?? ratePerSession ?? "—"}</td>
            </tr>
            <tr style="background:#f9f9f9">
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#555">Current channels</td>
              <td style="padding:10px 14px;font-size:14px;color:#111">${channelList}</td>
            </tr>
          </table>

          ${results ? `
          <h2 style="font-size:16px;font-weight:700;margin:0 0 12px;color:#111">Calculator results shown</h2>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:14px"><strong>Current est. monthly revenue:</strong> ${fmt(results.currentMonthly)}</p>
            <p style="margin:0 0 8px;font-size:14px"><strong>Potential monthly revenue:</strong> ${fmt(results.potentialMonthly)}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#059669"><strong>Extra monthly opportunity: ${fmt(results.extraMonthly)}</strong></p>
            <p style="margin:0;font-size:14px"><strong>Admin hours to save:</strong> ${results.adminHours}+ hrs/month</p>
          </div>
          ` : ""}

          <a href="mailto:${email}" style="display:inline-block;background:#059669;color:white;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">
            Reply to ${name} →
          </a>

          <p style="margin-top:24px;font-size:12px;color:#aaa">Sent from the VIV-Z lead calculator</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
