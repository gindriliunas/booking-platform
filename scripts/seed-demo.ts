/**
 * Demo seed script — populates sample clients, packages, and bookings.
 * Requires DEMO_PROVIDER_EMAIL to match an existing provider.
 *
 * Run: DEMO_PROVIDER_EMAIL=you@example.com npx tsx scripts/seed-demo.ts
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

// Load .env.local
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.error("Could not load .env.local — make sure DATABASE_URL is set");
    process.exit(1);
  }
}

loadEnv();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// ── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function atHour(base: Date, hour: number, minute = 0) {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ── data ─────────────────────────────────────────────────────────────────────

const CLIENTS = [
  { name: "Sarah Mitchell",  email: "sarah.mitchell@gmail.com",   phone: "+1 555-0101" },
  { name: "James Kowalski",  email: "james.kowalski@outlook.com", phone: "+1 555-0102" },
  { name: "Priya Nair",      email: "priya.nair@gmail.com",       phone: "+1 555-0103" },
  { name: "Daniel Osei",     email: "daniel.osei@hotmail.com",    phone: "+1 555-0104" },
  { name: "Emma Thornton",   email: "emma.thornton@gmail.com",    phone: "+1 555-0105" },
  { name: "Luca Ferretti",   email: "luca.ferretti@gmail.com",    phone: "+1 555-0106" },
  { name: "Aisha Rahman",    email: "aisha.rahman@yahoo.com",     phone: "+1 555-0107" },
  { name: "Tom Brewer",      email: "tom.brewer@gmail.com",       phone: "+1 555-0108" },
  { name: "Chloe Dubois",    email: "chloe.dubois@gmail.com",     phone: "+1 555-0109" },
  { name: "Marcus Webb",     email: "marcus.webb@outlook.com",    phone: "+1 555-0110" },
  { name: "Olivia Chen",     email: "olivia.chen@gmail.com",      phone: "+1 555-0111" },
  { name: "Ryan Patel",      email: "ryan.patel@hotmail.com",     phone: "+1 555-0112" },
];

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Find provider
  const demoEmail = process.env.DEMO_PROVIDER_EMAIL?.toLowerCase();
  if (!demoEmail) {
    console.error("Set DEMO_PROVIDER_EMAIL to an existing provider email.");
    process.exit(1);
  }

  const [provider] = await db
    .select()
    .from(schema.providers)
    .where(eq(schema.providers.email, demoEmail))
    .limit(1);

  if (!provider) {
    console.error(`Provider ${demoEmail} not found. Run scripts/create-provider.ts first.`);
    console.error("    Make sure you have logged in and created your provider profile.");
    process.exit(1);
  }

  console.log(`✅  Found provider: ${provider.name} (${provider.id})`);

  // 2. Packages
  console.log("📦  Creating packages…");

  const existingPackages = await db
    .select()
    .from(schema.packages)
    .where(eq(schema.packages.providerId, provider.id));

  let pkg10: typeof existingPackages[0];
  let pkg5: typeof existingPackages[0];
  let pkg20: typeof existingPackages[0];

  if (existingPackages.length === 0) {
    const inserted = await db
      .insert(schema.packages)
      .values([
        {
          providerId: provider.id,
          name: "Starter Pack",
          description: "5 personal training sessions",
          sessionCount: 5,
          price: "250.00",
          currency: "usd",
          validityDays: 90,
          isActive: true,
          sessionType: "individual",
        },
        {
          providerId: provider.id,
          name: "Classic Pack",
          description: "10 personal training sessions",
          sessionCount: 10,
          price: "450.00",
          currency: "usd",
          validityDays: 120,
          isActive: true,
          sessionType: "individual",
        },
        {
          providerId: provider.id,
          name: "Transformation Pack",
          description: "20 sessions — best value",
          sessionCount: 20,
          price: "800.00",
          currency: "usd",
          validityDays: 180,
          isActive: true,
          sessionType: "individual",
        },
      ])
      .returning();
    [pkg5, pkg10, pkg20] = inserted;
    console.log("    Created 3 packages");
  } else {
    pkg5 = existingPackages[0];
    pkg10 = existingPackages[1] ?? existingPackages[0];
    pkg20 = existingPackages[2] ?? existingPackages[0];
    console.log(`    Using ${existingPackages.length} existing packages`);
  }

  // 3. Subscription plans
  console.log("📋  Creating subscription plans…");

  const existingPlans = await db
    .select()
    .from(schema.subscriptionPlans)
    .where(eq(schema.subscriptionPlans.providerId, provider.id));

  let plan4: typeof existingPlans[0];

  if (existingPlans.length === 0) {
    const inserted = await db
      .insert(schema.subscriptionPlans)
      .values([
        {
          providerId: provider.id,
          name: "Monthly Elite",
          description: "4 sessions per month, unlimited renewal",
          sessionsPerPeriod: 4,
          billingPeriod: "monthly",
          price: "200.00",
          currency: "usd",
          isActive: true,
          sessionType: "individual",
        },
        {
          providerId: provider.id,
          name: "Weekly Grind",
          description: "2 sessions per week",
          sessionsPerPeriod: 2,
          billingPeriod: "weekly",
          price: "80.00",
          currency: "usd",
          isActive: true,
          sessionType: "individual",
        },
      ])
      .returning();
    [plan4] = inserted;
    console.log("    Created 2 subscription plans");
  } else {
    plan4 = existingPlans[0];
    console.log(`    Using ${existingPlans.length} existing subscription plans`);
  }

  // 4. Clients
  console.log("👥  Creating clients…");

  const clientIds: string[] = [];

  for (const c of CLIENTS) {
    // Skip if already exists
    const existing = await db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.email, c.email))
      .limit(1);

    if (existing.length > 0) {
      clientIds.push(existing[0].id);
      console.log(`    Skipped (exists): ${c.name}`);
      continue;
    }

    const [inserted] = await db
      .insert(schema.clients)
      .values({
        providerId: provider.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
      })
      .returning();

    clientIds.push(inserted.id);
    console.log(`    Created: ${c.name}`);
  }

  // 5. Client packages
  console.log("🛍️  Creating client package purchases…");

  const packageAssignments: Array<{ clientId: string; packageId: string; sessionsTotal: number; sessionsUsed: number; status: "active" | "exhausted" | "expired" | "refunded" }> = [
    { clientId: clientIds[0],  packageId: pkg10.id, sessionsTotal: 10, sessionsUsed: 6,  status: "active"    },
    { clientId: clientIds[1],  packageId: pkg10.id, sessionsTotal: 10, sessionsUsed: 10, status: "exhausted" },
    { clientId: clientIds[2],  packageId: pkg5.id,  sessionsTotal: 5,  sessionsUsed: 2,  status: "active"    },
    { clientId: clientIds[3],  packageId: pkg20.id, sessionsTotal: 20, sessionsUsed: 8,  status: "active"    },
    { clientId: clientIds[4],  packageId: pkg5.id,  sessionsTotal: 5,  sessionsUsed: 5,  status: "exhausted" },
    { clientId: clientIds[5],  packageId: pkg10.id, sessionsTotal: 10, sessionsUsed: 3,  status: "active"    },
    { clientId: clientIds[6],  packageId: pkg20.id, sessionsTotal: 20, sessionsUsed: 15, status: "active"    },
    { clientId: clientIds[7],  packageId: pkg5.id,  sessionsTotal: 5,  sessionsUsed: 1,  status: "active"    },
  ];

  const cpIds: Record<string, string> = {};

  for (const pa of packageAssignments) {
    const [cp] = await db
      .insert(schema.clientPackages)
      .values({
        clientId: pa.clientId,
        packageId: pa.packageId,
        sessionsTotal: pa.sessionsTotal,
        sessionsUsed: pa.sessionsUsed,
        sessionsRemaining: pa.sessionsTotal - pa.sessionsUsed,
        status: pa.status,
        paymentMethod: "cash",
        purchasedAt: daysAgo(Math.floor(Math.random() * 60) + 10),
      })
      .returning();
    cpIds[pa.clientId] = cp.id;
  }
  console.log(`    Created ${packageAssignments.length} client packages`);

  // 6. Client subscriptions (for last 4 clients)
  console.log("🔄  Creating client subscriptions…");

  const subClients = clientIds.slice(8, 12);
  const csIds: Record<string, string> = {};

  for (const cid of subClients) {
    const periodStart = daysAgo(15);
    const periodEnd = daysFromNow(15);

    const [cs] = await db
      .insert(schema.clientSubscriptions)
      .values({
        clientId: cid,
        planId: plan4.id,
        status: "active",
        sessionsUsedThisPeriod: Math.floor(Math.random() * 3),
        sessionsPerPeriod: plan4.sessionsPerPeriod,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        paymentMethod: "cash",
      })
      .returning();

    csIds[cid] = cs.id;
  }
  console.log(`    Created ${subClients.length} active subscriptions`);

  // 7. Bookings
  console.log("📅  Creating bookings…");

  type BookingRow = {
    providerId: string;
    clientId: string;
    title: string;
    startTime: Date;
    endTime: Date;
    status: "scheduled" | "completed" | "cancelled" | "no_show";
    sessionSource: "package" | "subscription" | "single";
    clientPackageId?: string;
    clientSubscriptionId?: string;
    sessionType: "individual" | "group";
    notes?: string;
  };

  const sessionDur = (provider.sessionDurationMins ?? 60) * 60 * 1000;

  const bookingRows: BookingRow[] = [];

  // Past completed sessions (last 30 days)
  const pastSlots = [
    { daysAgoN: 28, hour: 9  },
    { daysAgoN: 25, hour: 11 },
    { daysAgoN: 21, hour: 10 },
    { daysAgoN: 18, hour: 14 },
    { daysAgoN: 14, hour: 9  },
    { daysAgoN: 11, hour: 16 },
    { daysAgoN:  7, hour: 10 },
    { daysAgoN:  7, hour: 14 },
    { daysAgoN:  4, hour: 9  },
    { daysAgoN:  3, hour: 11 },
    { daysAgoN:  2, hour: 15 },
    { daysAgoN:  1, hour: 10 },
  ];

  const pastClients = [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 3, 6];

  for (let i = 0; i < pastSlots.length; i++) {
    const s = pastSlots[i];
    const ci = clientIds[pastClients[i]];
    const start = atHour(daysAgo(s.daysAgoN), s.hour);
    const end = new Date(start.getTime() + sessionDur);
    const cname = CLIENTS[pastClients[i]].name.split(" ")[0];

    bookingRows.push({
      providerId: provider.id,
      clientId: ci,
      title: `Session – ${cname}`,
      startTime: start,
      endTime: end,
      status: i === 5 ? "no_show" : "completed",
      sessionSource: cpIds[ci] ? "package" : csIds[ci] ? "subscription" : "single",
      clientPackageId: cpIds[ci],
      clientSubscriptionId: csIds[ci],
      sessionType: "individual",
    });
  }

  // Today's sessions
  const todayClients = [
    { idx: 0, hour: 10, min: 0  },
    { idx: 1, hour: 11, min: 30 },
    { idx: 2, hour: 14, min: 0  },
  ];
  for (const t of todayClients) {
    const ci = clientIds[t.idx];
    const start = atHour(new Date(), t.hour, t.min);
    const end = new Date(start.getTime() + sessionDur);
    const cname = CLIENTS[t.idx].name.split(" ")[0];
    bookingRows.push({
      providerId: provider.id,
      clientId: ci,
      title: `Session – ${cname}`,
      startTime: start,
      endTime: end,
      status: "scheduled",
      sessionSource: cpIds[ci] ? "package" : "single",
      clientPackageId: cpIds[ci],
      sessionType: "individual",
    });
  }

  // Future sessions (next 14 days)
  const futureSlots = [
    { daysN: 1, hour: 9,  idx: 3 },
    { daysN: 1, hour: 15, idx: 4 },
    { daysN: 2, hour: 10, idx: 5 },
    { daysN: 3, hour: 11, idx: 6 },
    { daysN: 4, hour: 9,  idx: 7 },
    { daysN: 5, hour: 14, idx: 8 },
    { daysN: 7, hour: 10, idx: 9 },
    { daysN: 8, hour: 9,  idx: 0 },
    { daysN: 9, hour: 11, idx: 10},
    { daysN:10, hour: 14, idx: 11},
    { daysN:12, hour: 10, idx: 1 },
    { daysN:14, hour: 9,  idx: 2 },
  ];

  for (const f of futureSlots) {
    const ci = clientIds[f.idx];
    const start = atHour(daysFromNow(f.daysN), f.hour);
    const end = new Date(start.getTime() + sessionDur);
    const cname = CLIENTS[f.idx].name.split(" ")[0];
    bookingRows.push({
      providerId: provider.id,
      clientId: ci,
      title: `Session – ${cname}`,
      startTime: start,
      endTime: end,
      status: "scheduled",
      sessionSource: cpIds[ci] ? "package" : csIds[ci] ? "subscription" : "single",
      clientPackageId: cpIds[ci],
      clientSubscriptionId: csIds[ci],
      sessionType: "individual",
    });
  }

  // Insert all bookings
  for (const row of bookingRows) {
    await db.insert(schema.bookings).values({
      providerId: row.providerId,
      clientId: row.clientId,
      title: row.title,
      startTime: row.startTime,
      endTime: row.endTime,
      status: row.status,
      sessionSource: row.sessionSource,
      clientPackageId: row.clientPackageId ?? null,
      clientSubscriptionId: row.clientSubscriptionId ?? null,
      sessionType: row.sessionType,
      notes: row.notes ?? null,
    });
  }

  console.log(`    Created ${bookingRows.length} bookings (${pastSlots.length} past, ${todayClients.length} today, ${futureSlots.length} future)`);

  console.log("\n🎉  Seed complete!");
  console.log(`    Clients: ${clientIds.length}`);
  console.log(`    Packages assigned: ${packageAssignments.length}`);
  console.log(`    Subscriptions: ${subClients.length}`);
  console.log(`    Bookings: ${bookingRows.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
