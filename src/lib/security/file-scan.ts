import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { scanBufferWithClamd } from "./clamav";

export type FileScanOutcome =
  | { status: "clean"; skipped?: boolean }
  | { status: "infected"; signature: string }
  | { status: "error"; message: string };

function fileScanModeOff(): boolean {
  return process.env.FILE_SCAN_MODE === "off" || process.env.FILE_SCAN_MODE === "skip";
}

function scanningRequired(): boolean {
  if (fileScanModeOff()) return false;
  if (process.env.FILE_SCAN_REQUIRED === "true") return true;
  return process.env.NODE_ENV === "production";
}

function hasClamConfigured(): boolean {
  return !!process.env.CLAMD_HOST?.trim();
}

function hasVtConfigured(): boolean {
  return !!process.env.VIRUSTOTAL_API_KEY?.trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function quarantineBuffer(
  buffer: Buffer,
  meta: { context: string; reason: string }
): Promise<void> {
  const dir = process.env.FILE_QUARANTINE_DIR?.trim();
  if (!dir) return;
  try {
    await mkdir(dir, { recursive: true });
    const safeCtx = meta.context.replace(/[^a-z0-9_-]/gi, "_").slice(0, 64);
    const name = `${Date.now()}_${randomUUID()}_${safeCtx}.bin`;
    await writeFile(join(dir, name), buffer);
  } catch (e) {
    console.error("[file-scan] quarantine write failed:", e);
  }
}

async function scanVirusTotal(buffer: Buffer): Promise<FileScanOutcome> {
  const key = process.env.VIRUSTOTAL_API_KEY!.trim();
  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(buffer)]),
    "upload.bin"
  );

  const uploadRes = await fetch("https://www.virustotal.com/api/v3/files", {
    method: "POST",
    headers: { "x-apikey": key },
    body: form,
  });

  if (!uploadRes.ok) {
    const t = await uploadRes.text();
    return {
      status: "error",
      message: `VirusTotal upload failed (${uploadRes.status}): ${t.slice(0, 200)}`,
    };
  }

  const uploadJson = (await uploadRes.json()) as {
    data?: { id?: string; type?: string };
  };
  const analysisId = uploadJson.data?.id;
  if (!analysisId) {
    return { status: "error", message: "VirusTotal: missing analysis id" };
  }

  const deadline = Date.now() + 60_000;
  const pollMs = Math.max(
    0,
    Number.parseInt(process.env.FILE_SCAN_VT_POLL_MS ?? "2000", 10) || 2000
  );

  for (;;) {
    const ar = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      { headers: { "x-apikey": key } }
    );
    if (!ar.ok) {
      const t = await ar.text();
      return {
        status: "error",
        message: `VirusTotal analysis poll failed (${ar.status}): ${t.slice(0, 200)}`,
      };
    }
    const aj = (await ar.json()) as {
      data?: {
        attributes?: {
          status?: string;
          stats?: { malicious?: number; suspicious?: number };
        };
      };
    };
    const st = aj.data?.attributes?.status;
    if (st === "completed") {
      const malicious = aj.data?.attributes?.stats?.malicious ?? 0;
      const suspicious = aj.data?.attributes?.stats?.suspicious ?? 0;
      if (malicious > 0 || suspicious > 0) {
        return {
          status: "infected",
          signature: `VirusTotal: ${malicious} malicious, ${suspicious} suspicious engines`,
        };
      }
      return { status: "clean" };
    }
    if (st !== "queued" && st !== "in_progress") {
      return { status: "error", message: `VirusTotal: unexpected status ${st}` };
    }
    if (Date.now() >= deadline) {
      return { status: "error", message: "VirusTotal: analysis timed out" };
    }
    await sleep(pollMs);
  }
}

/**
 * Scans raw upload bytes before persistence or processing.
 * Configure `CLAMD_HOST` (optional port `CLAMD_PORT`) and/or `VIRUSTOTAL_API_KEY`.
 * Set `FILE_SCAN_MODE=off` to disable (development only).
 * In production (`NODE_ENV=production`) or when `FILE_SCAN_REQUIRED=true`, a scanner must be configured.
 */
export async function scanUploadedBytesBeforeStorage(
  buffer: Buffer,
  meta: { context: string; mime?: string }
): Promise<FileScanOutcome> {
  if (fileScanModeOff()) {
    return { status: "clean", skipped: true };
  }

  const required = scanningRequired();
  const clam = hasClamConfigured();
  const vt = hasVtConfigured();

  if (required && !clam && !vt) {
    return {
      status: "error",
      message:
        "Virus scanning is required but no scanner is configured. Set CLAMD_HOST or VIRUSTOTAL_API_KEY.",
    };
  }

  if (!clam && !vt) {
    console.warn(
      "[file-scan] No scanner configured; allowing upload (not production / not required)"
    );
    return { status: "clean", skipped: true };
  }

  let outcome: FileScanOutcome;

  if (clam) {
    const host = process.env.CLAMD_HOST!.trim();
    const port = process.env.CLAMD_PORT ? parseInt(process.env.CLAMD_PORT, 10) : 3310;
    const r = await scanBufferWithClamd(buffer, { host, port });
    if (r.ok) {
      outcome = { status: "clean" };
    } else if ("signature" in r) {
      outcome = { status: "infected", signature: r.signature };
    } else {
      outcome = { status: "error", message: r.error ?? "clamd scan failed" };
    }
  } else {
    outcome = await scanVirusTotal(buffer);
  }

  if (outcome.status === "infected") {
    await quarantineBuffer(buffer, {
      context: meta.context,
      reason: outcome.signature,
    });
  }

  return outcome;
}
