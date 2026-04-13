/** Max decoded image size for invoice logo (matches client-side cap). */
export const MAX_INVOICE_LOGO_BYTES = 500 * 1024;

const ALLOWED_IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
]);

export type ParsedImageDataUrl =
  | { ok: true; buffer: Buffer; mime: string }
  | { ok: false; error: string };

/**
 * Parses a data URL produced by FileReader.readAsDataURL for allowed image types.
 */
export function parseInvoiceImageDataUrl(dataUrl: string): ParsedImageDataUrl {
  const trimmed = dataUrl.trim();
  const m = /^data:([^;,]+)(;charset=[^;,]+)?;base64,([\s\S]*)$/i.exec(
    trimmed
  );
  if (!m) {
    return { ok: false, error: "Invalid data URL format" };
  }
  const mime = m[1].trim().toLowerCase().split(/\s+/)[0];
  if (!ALLOWED_IMAGE_MIMES.has(mime)) {
    return { ok: false, error: "Image type not allowed" };
  }
  const b64 = m[3].replace(/\s/g, "");
  let buffer: Buffer;
  try {
    buffer = Buffer.from(b64, "base64");
  } catch {
    return { ok: false, error: "Invalid base64 payload" };
  }
  if (buffer.length === 0) {
    return { ok: false, error: "Empty file" };
  }
  if (buffer.length > MAX_INVOICE_LOGO_BYTES) {
    return { ok: false, error: `File exceeds ${MAX_INVOICE_LOGO_BYTES} bytes` };
  }
  return { ok: true, buffer, mime };
}

export function isProbablyDataUrlImage(value: string): boolean {
  return /^data:image\//i.test(value.trim());
}
