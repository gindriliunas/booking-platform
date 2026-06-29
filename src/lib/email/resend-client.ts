import { Resend } from "resend";
import type { CreateEmailOptions } from "resend";

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim();
}

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? "noreply@yourapp.com";
}

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

export type SendEmailResult =
  | { ok: true }
  | { ok: false; reason: string };

/** Sends via Resend when RESEND_API_KEY is set; otherwise skips (dev-safe). */
export async function sendEmail(options: CreateEmailOptions): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[email] RESEND_API_KEY not set — skipping send to", options.to);
    }
    return { ok: false, reason: "Email not configured" };
  }

  await resend.emails.send(options);
  return { ok: true };
}
