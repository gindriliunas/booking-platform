import { describe, expect, it } from "vitest";
import { parseClamdReply } from "./clamav";

describe("parseClamdReply", () => {
  it("detects clean scan", () => {
    expect(parseClamdReply("stream: OK\n")).toEqual({ ok: true });
  });

  it("detects malware signature", () => {
    const r = parseClamdReply("stream: Eicar-Test-Signature FOUND\n");
    expect(r.ok).toBe(false);
    if (!r.ok && "signature" in r) {
      expect(r.signature).toContain("Eicar");
    }
  });

  it("detects FOUND on multi-line output", () => {
    const r = parseClamdReply("n: some-path: Win.Trojan.Foo FOUND\n");
    expect(r.ok).toBe(false);
    if (!r.ok && "signature" in r) {
      expect(r.signature).toContain("Win.Trojan");
    }
  });
});
