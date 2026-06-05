/**
 * Create the first provider account (email + password).
 *
 * Usage:
 *   DEMO_PROVIDER_EMAIL=you@example.com DEMO_PROVIDER_PASSWORD='YourSecurePass1!' npx tsx scripts/create-provider.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import * as schema from "../src/lib/db/schema";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    for (const line of readFileSync(envPath, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.error("Could not load .env.local — set DATABASE_URL in the environment.");
    process.exit(1);
  }
}

loadEnv();

const rawEmail = process.env.DEMO_PROVIDER_EMAIL;
const password = process.env.DEMO_PROVIDER_PASSWORD;
const name = process.env.DEMO_PROVIDER_NAME ?? "Demo Provider";

if (!rawEmail || !password) {
  console.error("Set DEMO_PROVIDER_EMAIL and DEMO_PROVIDER_PASSWORD.");
  process.exit(1);
}

const email = rawEmail.toLowerCase();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function main() {
  const pwd = password!;
  const [existing] = await db
    .select()
    .from(schema.providers)
    .where(eq(schema.providers.email, email));

  if (existing) {
    console.log(`Provider already exists for ${email} (id: ${existing.id})`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(pwd, 12);
  const id = randomUUID();

  await db.insert(schema.providers).values({
    id,
    name,
    email,
    passwordHash,
  });

  console.log(`Created provider "${name}" (${email}) with id ${id}`);
  await client.end({ timeout: 5 });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
