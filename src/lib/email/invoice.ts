import { getResendFromEmail, sendEmail, type SendEmailResult } from "@/lib/email/resend-client";

export interface InvoiceParams {
  clientEmail: string;
  clientName: string;
  providerName: string;
  providerEmail?: string | null;
  invoiceBusinessName?: string | null;
  invoiceAddress?: string | null;
  invoiceTaxId?: string | null;
  invoiceLogoUrl?: string | null;
  invoiceFooterNote?: string | null;
  itemName: string;
  itemDescription?: string | null;
  amount: string; // formatted, e.g. "$500.00"
  currency: string;
  issuedAt: string; // human-readable, e.g. "April 6, 2026"
  invoiceNumber?: string | null;
}

export async function sendInvoiceEmail(params: InvoiceParams): Promise<SendEmailResult> {
  const {
    clientEmail, clientName, providerName, providerEmail,
    invoiceBusinessName, invoiceAddress, invoiceTaxId, invoiceLogoUrl,
    invoiceFooterNote, itemName, amount, issuedAt, invoiceNumber,
  } = params;

  const businessDisplayName = invoiceBusinessName || providerName;
  const invNum = invoiceNumber ?? `INV-${Date.now()}`;

  const logoHtml = invoiceLogoUrl
    ? `<img src="${invoiceLogoUrl}" alt="${businessDisplayName}" style="max-height:60px;max-width:180px;object-fit:contain;margin-bottom:16px" />`
    : `<p style="font-size:22px;font-weight:700;color:#111;margin:0 0 16px">${businessDisplayName}</p>`;

  const addressHtml = invoiceAddress
    ? `<p style="margin:2px 0;color:#666;font-size:13px">${invoiceAddress.replace(/\n/g, "<br/>")}</p>`
    : "";

  const taxHtml = invoiceTaxId
    ? `<p style="margin:2px 0;color:#666;font-size:13px">Tax ID: ${invoiceTaxId}</p>`
    : "";

  const footerHtml = invoiceFooterNote
    ? `<p style="color:#888;font-size:13px;margin-top:24px;border-top:1px solid #eee;padding-top:16px">${invoiceFooterNote}</p>`
    : "";

  return sendEmail({
    from: getResendFromEmail(),
    to: clientEmail,
    replyTo: providerEmail ?? undefined,
    subject: `Invoice ${invNum} from ${businessDisplayName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
        <!-- Header -->
        <div style="margin-bottom:32px">
          ${logoHtml}
          ${addressHtml}
          ${taxHtml}
        </div>

        <!-- Invoice meta -->
        <div style="display:flex;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:8px">
          <div>
            <p style="margin:0;font-size:24px;font-weight:700;color:#111">Invoice</p>
            <p style="margin:4px 0 0;color:#888;font-size:13px">${invNum}</p>
          </div>
          <div style="text-align:right">
            <p style="margin:0;color:#666;font-size:13px">Issued</p>
            <p style="margin:2px 0 0;font-weight:600;font-size:14px">${issuedAt}</p>
          </div>
        </div>

        <!-- Billed to -->
        <div style="margin-bottom:24px">
          <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#888">Billed to</p>
          <p style="margin:0;font-weight:600;font-size:15px">${clientName}</p>
          <p style="margin:2px 0 0;color:#666;font-size:13px">${clientEmail}</p>
        </div>

        <!-- Line items -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <thead>
            <tr style="border-bottom:2px solid #f0f0f0">
              <th style="text-align:left;padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#888">Description</th>
              <th style="text-align:right;padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#888">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #f5f5f5">
              <td style="padding:14px 0;font-size:14px;font-weight:500">${itemName}</td>
              <td style="padding:14px 0;font-size:14px;font-weight:600;text-align:right">${amount}</td>
            </tr>
          </tbody>
        </table>

        <!-- Total -->
        <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">
          <span style="font-weight:600;font-size:15px">Total due</span>
          <span style="font-weight:700;font-size:20px;color:#111">${amount}</span>
        </div>

        ${footerHtml}

        <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
        <p style="color:#aaa;font-size:12px">Sent by ${businessDisplayName} via the client management platform.</p>
      </div>
    `,
  });
}
