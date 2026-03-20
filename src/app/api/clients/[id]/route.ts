import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, clientPackages, clientSubscriptions, bookings, packages, subscriptionPlans, clientQuestionnaires } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [clientPkgs, clientSubs, clientBookings, clientForms] = await Promise.all([
    db
      .select({ cp: clientPackages, pkg: packages })
      .from(clientPackages)
      .innerJoin(packages, eq(clientPackages.packageId, packages.id))
      .where(eq(clientPackages.clientId, id))
      .orderBy(clientPackages.purchasedAt),

    db
      .select({ cs: clientSubscriptions, plan: subscriptionPlans })
      .from(clientSubscriptions)
      .innerJoin(subscriptionPlans, eq(clientSubscriptions.planId, subscriptionPlans.id))
      .where(eq(clientSubscriptions.clientId, id))
      .orderBy(clientSubscriptions.createdAt),

    db
      .select()
      .from(bookings)
      .where(eq(bookings.clientId, id))
      .orderBy(bookings.startTime),

    db
      .select()
      .from(clientQuestionnaires)
      .where(eq(clientQuestionnaires.clientId, id)),
  ]);

  const hasFormCompleted = clientForms.some((f) => f.status === "completed");
  const hasPackageOrSub = clientPkgs.length > 0 || clientSubs.length > 0;
  const hasBooking = clientBookings.length > 0;
  const onboardingComplete = hasFormCompleted && hasPackageOrSub && hasBooking;

  return NextResponse.json({
    client,
    packages: clientPkgs.map(({ cp, pkg }) => ({ ...cp, packageName: pkg.name, sessionType: pkg.sessionType, price: pkg.price, currency: pkg.currency })),
    subscriptions: clientSubs.map(({ cs, plan }) => ({ ...cs, planName: plan.name, billingPeriod: plan.billingPeriod, sessionType: plan.sessionType, price: plan.price, currency: plan.currency })),
    bookings: clientBookings,
    onboarding: {
      hasFormCompleted,
      hasPackageOrSub,
      hasBooking,
      isComplete: onboardingComplete,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, email, phone, notes } = body;

  const [updated] = await db
    .update(clients)
    .set({ name, email: email ?? null, phone: phone ?? null, notes: notes ?? null, updatedAt: new Date() })
    .where(eq(clients.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ client: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(clients).where(eq(clients.id, id));
  return NextResponse.json({ ok: true });
}
