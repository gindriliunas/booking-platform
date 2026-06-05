import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { inArray } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

function loadEnv() {
  const lines = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf("=");
    if (idx === -1) continue;
    const key = t.slice(0, idx).trim();
    const val = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

const SEEDED_EMAILS = [
  "sarah.mitchell@gmail.com",
  "james.kowalski@outlook.com",
  "priya.nair@gmail.com",
  "daniel.osei@hotmail.com",
  "emma.thornton@gmail.com",
  "luca.ferretti@gmail.com",
  "aisha.rahman@yahoo.com",
  "tom.brewer@gmail.com",
  "chloe.dubois@gmail.com",
  "marcus.webb@outlook.com",
  "olivia.chen@gmail.com",
  "ryan.patel@hotmail.com",
];

async function main() {
  const clients = await db
    .select({ id: schema.clients.id, name: schema.clients.name })
    .from(schema.clients)
    .where(inArray(schema.clients.email, SEEDED_EMAILS));

  const ids = clients.map((c) => c.id);
  console.log(`Found ${ids.length} seeded clients`);

  if (ids.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  // Bookings must be deleted first (onDelete: set null — no cascade)
  await db.delete(schema.bookings).where(inArray(schema.bookings.clientId, ids));
  console.log("Deleted bookings");

  // Clients cascade → client_packages, client_subscriptions, booking_participants
  await db.delete(schema.clients).where(inArray(schema.clients.id, ids));
  console.log(`Deleted ${ids.length} clients (+ packages, subscriptions via cascade)`);

  console.log("Cleanup complete.");
}

main().catch((e) => { console.error(e); process.exit(1); });
