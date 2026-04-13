import { describe, expect, it } from "vitest";
import {
  MAX_INVOICE_LOGO_BYTES,
  isProbablyDataUrlImage,
  parseInvoiceImageDataUrl,
} from "./image-data-url";

/** 1×1 transparent PNG */
const TINY_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("parseInvoiceImageDataUrl", () => {
  it("accepts a valid PNG data URL", () => {
    const r = parseInvoiceImageDataUrl(`data:image/png;base64,${TINY_PNG_B64}`);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.mime).toBe("image/png");
      expect(r.buffer.length).toBeGreaterThan(0);
    }
  });

  it("rejects non-data URLs", () => {
    const r = parseInvoiceImageDataUrl("https://evil.com/x.png");
    expect(r.ok).toBe(false);
  });

  it("rejects disallowed mime types", () => {
    const r = parseInvoiceImageDataUrl(
      `data:application/javascript;base64,${Buffer.from("alert(1)").toString("base64")}`
    );
    expect(r.ok).toBe(false);
  });

  it("rejects oversize payloads", () => {
    const big = Buffer.alloc(MAX_INVOICE_LOGO_BYTES + 1, 0x41).toString("base64");
    const r = parseInvoiceImageDataUrl(`data:image/png;base64,${big}`);
    expect(r.ok).toBe(false);
  });
});

describe("isProbablyDataUrlImage", () => {
  it("detects image data URLs", () => {
    expect(isProbablyDataUrlImage(" data:image/png;base64,abc")).toBe(true);
  });

  it("returns false for remote URLs", () => {
    expect(isProbablyDataUrlImage("https://cdn.example.com/logo.png")).toBe(false);
  });
});
