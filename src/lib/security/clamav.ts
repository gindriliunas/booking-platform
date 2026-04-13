import net from "node:net";

export type ClamdScanResult =
  | { ok: true }
  | { ok: false; signature: string }
  | { ok: false; error: string };

/**
 * Parses clamd replies such as `stream: OK` or `stream: Eicar-Signature FOUND`.
 */
export function parseClamdReply(reply: string): ClamdScanResult {
  const t = reply.trim();
  if (/\bFOUND\b/i.test(t)) {
    const line = t
      .split(/\r?\n/)
      .find((l) => l.includes("FOUND")) ?? t;
    const m = line.match(/:\s*(.+?)\s+FOUND/i);
    return { ok: false, signature: (m?.[1] ?? "unknown").trim() };
  }
  if (/\bOK\b/i.test(t) && !/\bERROR\b/i.test(t)) {
    return { ok: true };
  }
  if (/ERROR/i.test(t)) {
    return { ok: false, error: t.slice(0, 500) };
  }
  return { ok: false, error: `Unrecognized clamd response: ${t.slice(0, 200)}` };
}

/**
 * Scans a buffer using clamd TCP INSTREAM (default port 3310).
 */
export function scanBufferWithClamd(
  buffer: Buffer,
  options: { host: string; port?: number; timeoutMs?: number }
): Promise<ClamdScanResult> {
  const port = options.port ?? 3310;
  const timeoutMs = options.timeoutMs ?? 15_000;

  return new Promise((resolve) => {
    const socket = net.createConnection({ host: options.host, port }, () => {
      try {
        socket.write("zINSTREAM\0");
        const chunkMax = 8192;
        let offset = 0;
        const writeNext = () => {
          if (offset >= buffer.length) {
            socket.write(Buffer.alloc(4));
            return;
          }
          const len = Math.min(chunkMax, buffer.length - offset);
          const header = Buffer.alloc(4);
          header.writeUInt32BE(len, 0);
          socket.write(header);
          socket.write(buffer.subarray(offset, offset + len));
          offset += len;
          writeNext();
        };
        writeNext();
      } catch (e) {
        socket.destroy();
        resolve({
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    });

    let reply = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok: false, error: `clamd connection timed out after ${timeoutMs}ms` });
    }, timeoutMs);

    const finish = (result: ClamdScanResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    socket.on("data", (chunk) => {
      reply += chunk.toString("utf8");
    });

    socket.on("close", () => {
      finish(parseClamdReply(reply));
    });

    socket.on("error", (err) => {
      finish({ ok: false, error: err.message });
    });
  });
}
