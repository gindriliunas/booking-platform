/**
 * Drop all objects in the public schema and recreate it empty.
 * Use before drizzle-kit push when the DB has leftover tables from an old schema.
 *
 * Usage:
 *   npx tsx scripts/reset-db-schema.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

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

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

async function main() {
  console.log("Dropping public schema (CASCADE)...");
  await sql.unsafe("DROP SCHEMA IF EXISTS public CASCADE");
  await sql.unsafe("CREATE SCHEMA public");
  await sql.unsafe("GRANT ALL ON SCHEMA public TO public");
  console.log("Public schema reset. Run: npx drizzle-kit push");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => sql.end());
