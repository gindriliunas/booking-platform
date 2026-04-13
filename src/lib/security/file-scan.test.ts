import { afterEach, describe, expect, it, vi } from "vitest";
import { scanUploadedBytesBeforeStorage } from "./file-scan";

describe("scanUploadedBytesBeforeStorage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns clean/skipped when FILE_SCAN_MODE is off", async () => {
    vi.stubEnv("FILE_SCAN_MODE", "off");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CLAMD_HOST", "");
    vi.stubEnv("VIRUSTOTAL_API_KEY", "");

    const r = await scanUploadedBytesBeforeStorage(Buffer.from("hello"), {
      context: "test",
    });
    expect(r).toEqual({ status: "clean", skipped: true });
  });

  it("requires a scanner in production when uploads must be scanned", async () => {
    vi.stubEnv("FILE_SCAN_MODE", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CLAMD_HOST", "");
    vi.stubEnv("VIRUSTOTAL_API_KEY", "");

    const r = await scanUploadedBytesBeforeStorage(Buffer.from("hello"), {
      context: "test",
    });
    expect(r.status).toBe("error");
    if (r.status === "error") {
      expect(r.message).toMatch(/scanner is configured/i);
    }
  });

  it("allows uploads without scanner in non-production when not explicitly required", async () => {
    vi.stubEnv("FILE_SCAN_MODE", "");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("FILE_SCAN_REQUIRED", "");
    vi.stubEnv("CLAMD_HOST", "");
    vi.stubEnv("VIRUSTOTAL_API_KEY", "");

    const r = await scanUploadedBytesBeforeStorage(Buffer.from("hello"), {
      context: "test",
    });
    expect(r).toEqual({ status: "clean", skipped: true });
  });

  it("uses VirusTotal when the API key is set (mocked)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("FILE_SCAN_MODE", "");
    vi.stubEnv("FILE_SCAN_VT_POLL_MS", "0");
    vi.stubEnv("CLAMD_HOST", "");
    vi.stubEnv("VIRUSTOTAL_API_KEY", "test-key");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "",
        json: async () => ({
          data: { id: "analysis-id-1", type: "analysis" },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "",
        json: async () => ({
          data: {
            attributes: {
              status: "completed",
              stats: { malicious: 0, suspicious: 0 },
            },
          },
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const r = await scanUploadedBytesBeforeStorage(Buffer.from("ok"), {
      context: "test",
    });
    expect(r).toEqual({ status: "clean" });
    expect(fetchMock).toHaveBeenCalled();
  });
});
