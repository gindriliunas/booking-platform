import { getResendFromEmail, sendEmail } from "@/lib/email/resend-client";

interface WaitlistNotificationParams {
  clientEmail: string;
  clientName: string;
  sessionTitle: string;
  sessionDate: string; // human-readable e.g. "Monday, April 7"
  sessionTime: string; // e.g. "10:00 AM"
  providerName: string;
  claimUrl: string;
}

export async function sendWaitlistSpotAvailableEmail(
  params: WaitlistNotificationParams
): Promise<void> {
  const { clientEmail, clientName, sessionTitle, sessionDate, sessionTime, providerName, claimUrl } = params;

  await sendEmail({
    from: getResendFromEmail(),
    to: clientEmail,
    subject: `A spot opened up — ${sessionTitle} on ${sessionDate}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Good news, ${clientName}!</h2>
        <p style="color:#555;line-height:1.6;margin-bottom:16px">
          A spot has opened up in a group session you were waitlisted for:
        </p>
        <div style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0;font-weight:600;font-size:16px">${sessionTitle}</p>
          <p style="margin:6px 0 0;color:#555;font-size:14px">${sessionDate} at ${sessionTime}</p>
          <p style="margin:4px 0 0;color:#888;font-size:13px">with ${providerName}</p>
        </div>
        <a href="${claimUrl}"
           style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px">
          Claim Your Spot
        </a>
        <p style="margin-top:20px;color:#888;font-size:13px;line-height:1.6">
          Spots are first-come, first-served. If you no longer need this spot, no action is needed.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
        <p style="color:#aaa;font-size:12px">Sent by ${providerName} via the client portal.</p>
      </div>
    `,
  });
}

interface WaitlistCancelledEmailParams {
  clientEmail: string;
  clientName: string;
  sessionTitle: string;
  sessionDate: string;
  providerName: string;
}

export async function sendWaitlistSessionCancelledEmail(
  params: WaitlistCancelledEmailParams
): Promise<void> {
  const { clientEmail, clientName, sessionTitle, sessionDate, providerName } = params;

  await sendEmail({
    from: getResendFromEmail(),
    to: clientEmail,
    subject: `Session cancelled — ${sessionTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Hi ${clientName},</h2>
        <p style="color:#555;line-height:1.6;margin-bottom:16px">
          Unfortunately, a session you were waitlisted for has been cancelled:
        </p>
        <div style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0;font-weight:600;font-size:16px">${sessionTitle}</p>
          <p style="margin:6px 0 0;color:#555;font-size:14px">${sessionDate}</p>
          <p style="margin:4px 0 0;color:#888;font-size:13px">with ${providerName}</p>
        </div>
        <p style="color:#555;font-size:14px;line-height:1.6">
          You have been automatically removed from the waitlist. Please contact ${providerName} to
          book an alternative session.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
        <p style="color:#aaa;font-size:12px">Sent by ${providerName} via the client portal.</p>
      </div>
    `,
  });
}
