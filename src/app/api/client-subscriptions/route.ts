import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientSubscriptions, subscriptionPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Manually assign a subscription plan to a client (no payment required)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, planId } = body;

  if (!clientId || !planId) {
    return NextResponse.json({ error: "clientId and planId required" }, { status: 400 });
  }

  const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId));
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const now = new Date();
  const periodEnd = new Date(now);
  if (plan.billingPeriod === "weekly") periodEnd.setDate(periodEnd.getDate() + 7);
  else if (plan.billingPeriod === "monthly") periodEnd.setMonth(periodEnd.getMonth() + 1);
  else if (plan.billingPeriod === "yearly") periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const { paymentMethod } = body;

  const [clientSub] = await db
    .insert(clientSubscriptions)
    .values({
      clientId,
      planId,
      sessionsPerPeriod: plan.sessionsPerPeriod,
      sessionsUsedThisPeriod: 0,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      paymentMethod: paymentMethod ?? null,
    })
    .returning();

  return NextResponse.json({ clientSubscription: clientSub }, { status: 201 });
}
