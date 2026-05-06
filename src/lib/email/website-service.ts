import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@vivz.co.uk";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "g.indriliunas@gmail.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.vivz.co.uk";

export interface WebsiteClientBrief {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  brandColours: string;
  hasLogo: boolean;
  logoUrl?: string | null;
  description: string;
  preferredStyle: string;
  referralSource?: string | null;
}

const styleLabels: Record<string, string> = {
  clean_minimal: "Clean & Minimal",
  bold_modern: "Bold & Modern",
  cinematic_3d: "Cinematic 3D",
};

function clientSlug(brief: WebsiteClientBrief) {
  return brief.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function sendAdminBuildNotification(brief: WebsiteClientBrief) {
  const slug = clientSlug(brief);
  const skillPath = String.raw`C:\Users\gindr\AppData\Roaming\Claude\local-agent-mode-sessions\fdd7678b-c80f-45aa-baef-2e190ceda4ee\e811821a-6df2-43e3-a7c4-523251179423\local_726dabd0-e2e5-453e-84bd-cb4b3472f020\outputs\cinematic-3d-website\SKILL.md`;

  const prompt = `Build a professional website using the cinematic-3d-website skill.

SKILL PATH: ${skillPath}

CLIENT BRIEF:
- Business: ${brief.businessName} (${brief.businessType})
- Contact: ${brief.name} <${brief.email}>
- Description: ${brief.description}
- Brand colours: ${brief.brandColours}
- Has logo: ${brief.hasLogo ? `Yes${brief.logoUrl ? ` — ${brief.logoUrl}` : ""}` : "No"}
- Style preference: ${styleLabels[brief.preferredStyle] ?? brief.preferredStyle}

REQUIREMENTS:
- Scaffold from the starter-template in the SKILL directory
- Output project to: C:\\Sites\\${slug}\\
- 5 pages: Home, About, Services, Testimonials, Contact
- Mobile-responsive, fully SEO-optimised (sitemap.xml, robots.txt, meta tags)
- Contact form using Formspree free tier
- Vercel project name: ${slug}-preview

AFTER BUILDING AND DEPLOYING TO VERCEL:
POST https://${APP_URL.replace(/^https?:\/\//, "")}/api/website-service/${brief.id}/built
Headers: Authorization: Bearer ${process.env.WEBSITE_SERVICE_ADMIN_TOKEN ?? "REPLACE_WITH_ADMIN_TOKEN"}
Body: { "vercelProjectId": "<paste project id>", "previewUrl": "<paste preview url>" }

This will automatically email the client their preview link.`;

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🏗️ New website request — ${brief.businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="margin-bottom:4px">New Website Request</h2>
        <p style="color:#555;margin-top:4px">${brief.businessName} · ${brief.businessType}</p>

        <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:140px">Contact</td><td style="padding:8px 12px">${brief.name} · ${brief.email}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Style</td><td style="padding:8px 12px">${styleLabels[brief.preferredStyle] ?? brief.preferredStyle}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Colours</td><td style="padding:8px 12px">${brief.brandColours}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Has logo</td><td style="padding:8px 12px">${brief.hasLogo ? "Yes" : "No"}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Description</td><td style="padding:8px 12px">${brief.description}</td></tr>
        </table>

        <h3 style="margin-bottom:8px">Claude Code Prompt</h3>
        <pre style="background:#1e1e1e;color:#d4d4d4;padding:20px;border-radius:8px;font-size:12px;line-height:1.6;overflow-x:auto;white-space:pre-wrap">${prompt}</pre>

        <a href="${APP_URL}/website-clients"
           style="display:inline-block;margin-top:20px;background:#4f46e5;color:#fff;
                  text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
          View in Admin Dashboard
        </a>
      </div>`,
  });
}

export async function sendClientPreviewEmail(params: {
  clientEmail: string;
  clientName: string;
  businessName: string;
  previewUrl: string;
  websiteClientId: string;
}) {
  const checkoutUrl = `${APP_URL}/website-activate/${params.websiteClientId}`;

  await resend.emails.send({
    from: FROM,
    to: params.clientEmail,
    subject: `✅ Your website is ready — ${params.businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="margin-bottom:8px">Your website is ready, ${params.clientName}!</h2>
        <p style="color:#555;line-height:1.6;margin-bottom:24px">
          We've built a custom website for <strong>${params.businessName}</strong>.
          Take a look and let us know what you think.
        </p>

        <a href="${params.previewUrl}"
           style="display:inline-block;background:#111;color:#fff;text-decoration:none;
                  padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px">
          View Your Website →
        </a>

        <div style="margin:32px 0;padding:20px;background:#f5f5f5;border-radius:8px">
          <p style="margin:0 0 12px;font-weight:600">Love what you see?</p>
          <p style="margin:0 0 16px;color:#555;font-size:14px">
            Activate your website for just <strong>£24/month</strong> — includes hosting,
            SSL, SEO, and your custom domain.
          </p>
          <a href="${checkoutUrl}"
             style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;
                    padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
            Activate for £24/month
          </a>
        </div>

        <p style="color:#888;font-size:13px;line-height:1.6">
          Not happy with something? Just reply to this email and we'll make changes.
          Your preview stays live until you decide — no rush.
        </p>
      </div>`,
  });
}

export async function sendDomainSetupEmail(params: {
  clientEmail: string;
  clientName: string;
  businessName: string;
  websiteClientId: string;
}) {
  const domainUrl = `${APP_URL}/website-activate/${params.websiteClientId}#domain`;

  await resend.emails.send({
    from: FROM,
    to: params.clientEmail,
    subject: `🎉 Payment confirmed — let's connect your domain`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="margin-bottom:8px">You're all set, ${params.clientName}!</h2>
        <p style="color:#555;line-height:1.6;margin-bottom:24px">
          Payment confirmed for <strong>${params.businessName}</strong>.
          One last step — connect your domain to make your site live.
        </p>

        <a href="${domainUrl}"
           style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;
                  padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px">
          Connect My Domain →
        </a>

        <p style="margin-top:24px;color:#888;font-size:13px;line-height:1.6">
          Don't have a domain yet? We recommend Namecheap or GoDaddy — a .co.uk domain
          costs around £8/year. Once you have one, come back to connect it.
        </p>
      </div>`,
  });
}
