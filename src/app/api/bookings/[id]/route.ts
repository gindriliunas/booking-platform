import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  bookings,
  bookingSeries,
  clientPackages,
  clientSubscriptions,
  bookingParticipants,
} from "@/lib/db/schema";
import { eq, and, gte, asc, gt } from "drizzle-orm";
async function resolvePackageForDeduction(booking: typeof bookings.$inferSelect) {
  if (booking.clientPackageId) {
    const [pkg] = await db
      .select()
      .from(clientPackages)
      .where(eq(clientPackages.id, booking.clientPackageId));
    return pkg ?? null;
  }
  if (!booking.clientId) return null;

  const [fallbackPkg] = await db
    .select()
    .from(clientPackages)
    .where(
      and(
        eq(clientPackages.clientId, booking.clientId),
        eq(clientPackages.status, "active"),
        gt(clientPackages.sessionsRemaining, 0)
      )
    )
    .orderBy(asc(clientPackages.purchasedAt));

  if (!fallbackPkg) return null;

  // Persist link so future updates and audit trails stay consistent.
  await db
    .update(bookings)
    .set({
      clientPackageId: fallbackPkg.id,
      sessionSource: "package",
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, booking.id));
  return fallbackPkg;
}

async function resolveSubscriptionForDeduction(booking: typeof bookings.$inferSelect) {
  if (booking.clientSubscriptionId) {
    const [sub] = await db
      .select()
      .from(clientSubscriptions)
      .where(eq(clientSubscriptions.id, booking.clientSubscriptionId));
    return sub ?? null;
  }
  if (!booking.clientId) return null;

  const [fallbackSub] = await db
    .select()
    .from(clientSubscriptions)
    .where(
      and(
        eq(clientSubscriptions.clientId, booking.clientId),
        eq(clientSubscriptions.status, "active")
      )
    )
    .orderBy(asc(clientSubscriptions.createdAt));

  if (!fallbackSub) return null;
  if (fallbackSub.sessionsUsedThisPeriod >= fallbackSub.sessionsPerPeriod) return null;

  await db
    .update(bookings)
    .set({
      clientSubscriptionId: fallbackSub.id,
      sessionSource: "subscription",
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, booking.id));
  return fallbackSub;
}

// Deducts a session credit for a single individual booking
async function deductIndividualSession(booking: typeof bookings.$inferSelect) {
  const pkg = await resolvePackageForDeduction(booking);
  if (pkg) {
    const newRemaining = Math.max(0, pkg.sessionsRemaining - 1);
    await db
      .update(clientPackages)
      .set({
        sessionsUsed: pkg.sessionsUsed + 1,
        sessionsRemaining: newRemaining,
        status: newRemaining <= 0 ? "exhausted" : "active",
      })
      .where(eq(clientPackages.id, pkg.id));
    return;
  }

  const sub = await resolveSubscriptionForDeduction(booking);
  if (sub) {
    await db
      .update(clientSubscriptions)
      .set({
        sessionsUsedThisPeriod: sub.sessionsUsedThisPeriod + 1,
      })
      .where(eq(clientSubscriptions.id, sub.id));
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const {
    title,
    startTime,
    endTime,
    status,
    notes,
    clientId,
    clientPackageId,
    sessionType,
    maxParticipants,
    editScope = "one", // "one" | "this_and_future" | "all"
  } = body;

  const bodySpecifiesClientPackage = Object.hasOwn(body, "clientPackageId");

  const [existing] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ── Series scope: collect affected bookings ──────────────────────────────
  let affectedBookings: (typeof bookings.$inferSelect)[] = [existing];

  if (editScope !== "one" && existing.bookingSeriesId) {
    const query =
      editScope === "this_and_future"
        ? and(
            eq(bookings.bookingSeriesId, existing.bookingSeriesId),
            gte(bookings.startTime, existing.startTime)
          )
        : eq(bookings.bookingSeriesId, existing.bookingSeriesId);

    affectedBookings = await db
      .select()
      .from(bookings)
      .where(query)
      .orderBy(asc(bookings.startTime));
  }

  // ── Cancellation: mark group participants as cancelled (no credit changes — deduction only happens on completion) ──
  if (status === "cancelled") {
    for (const b of affectedBookings) {
      if (b.status === "scheduled" && b.sessionType === "group") {
        await db
          .update(bookingParticipants)
          .set({ status: "cancelled" })
          .where(
            and(
              eq(bookingParticipants.bookingId, b.id),
              eq(bookingParticipants.status, "booked")
            )
          );
      }
    }
  }

  // ── Completion / No-show: deduct session credits ──────────────────────────
  if (status === "completed" || status === "no_show") {
    for (const b of affectedBookings) {
      if (b.status === "scheduled") {
        if (b.sessionType === "group") {
          const bookedParticipants = await db
            .select()
            .from(bookingParticipants)
            .where(
              and(
                eq(bookingParticipants.bookingId, b.id),
                eq(bookingParticipants.status, "booked")
              )
            );
          for (const p of bookedParticipants) {
            if (p.clientPackageId) {
              const [pkg] = await db.select().from(clientPackages).where(eq(clientPackages.id, p.clientPackageId));
              if (pkg) {
                const newRemaining = Math.max(0, pkg.sessionsRemaining - 1);
                await db.update(clientPackages).set({
                  sessionsUsed: pkg.sessionsUsed + 1,
                  sessionsRemaining: newRemaining,
                  status: newRemaining <= 0 ? "exhausted" : "active",
                }).where(eq(clientPackages.id, pkg.id));
              }
            }
            if (p.clientSubscriptionId) {
              const [sub] = await db.select().from(clientSubscriptions).where(eq(clientSubscriptions.id, p.clientSubscriptionId));
              if (sub) {
                await db.update(clientSubscriptions).set({
                  sessionsUsedThisPeriod: sub.sessionsUsedThisPeriod + 1,
                }).where(eq(clientSubscriptions.id, sub.id));
              }
            }
          }
        } else {
          await deductIndividualSession(b);
        }
      }
    }
  }

  // ── Compute time delta for series time shifts ─────────────────────────────
  const newStart = startTime ? new Date(startTime) : null;
  const deltaMs =
    newStart && editScope !== "one"
      ? newStart.getTime() - existing.startTime.getTime()
      : 0;
  const durationMs =
    endTime && startTime
      ? new Date(endTime).getTime() - new Date(startTime).getTime()
      : existing.endTime.getTime() - existing.startTime.getTime();

  // ── Apply updates to all affected bookings ────────────────────────────────
  const updatedBookings: (typeof bookings.$inferSelect)[] = [];

  for (const b of affectedBookings) {
    const effectiveSessionType = (sessionType ?? b.sessionType ?? "individual") as
      | "individual"
      | "group";

    const shiftedStart =
      editScope !== "one" && deltaMs !== 0
        ? new Date(b.startTime.getTime() + deltaMs)
        : b.id === id && newStart
        ? newStart
        : undefined;

    const shiftedEnd = shiftedStart
      ? new Date(shiftedStart.getTime() + durationMs)
      : b.id === id && endTime
      ? new Date(endTime)
      : undefined;

    const updateRow: Record<string, unknown> = {
      title: title ?? undefined,
      startTime: shiftedStart,
      endTime: shiftedEnd,
      status: status ?? undefined,
      notes: b.id === id ? notes ?? undefined : undefined,
      clientId: effectiveSessionType === "group" ? null : clientId ?? undefined,
      maxParticipants:
        maxParticipants != null ? parseInt(String(maxParticipants)) : undefined,
      updatedAt: new Date(),
    };

    if (effectiveSessionType === "group") {
      updateRow.clientPackageId = null;
    } else if (bodySpecifiesClientPackage) {
      updateRow.clientPackageId = clientPackageId ?? null;
    }

    const [updated] = await db
      .update(bookings)
      .set(updateRow as typeof bookings.$inferInsert)
      .where(eq(bookings.id, b.id))
      .returning();

    updatedBookings.push(updated);
  }

  const updated = updatedBookings[0];

  return NextResponse.json({ booking: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const deleteScope = searchParams.get("deleteScope") ?? "one"; // "one" | "this_and_future" | "all"

  const [existing] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id));
  if (!existing) return NextResponse.json({ ok: true });

  let toDelete: (typeof bookings.$inferSelect)[] = [existing];

  if (deleteScope !== "one" && existing.bookingSeriesId) {
    const query =
      deleteScope === "this_and_future"
        ? and(
            eq(bookings.bookingSeriesId, existing.bookingSeriesId),
            gte(bookings.startTime, existing.startTime)
          )
        : eq(bookings.bookingSeriesId, existing.bookingSeriesId);

    toDelete = await db
      .select()
      .from(bookings)
      .where(query)
      .orderBy(asc(bookings.startTime));
  }

  for (const b of toDelete) {
    await db.delete(bookings).where(eq(bookings.id, b.id));
  }

  // Clean up orphaned series row
  if (existing.bookingSeriesId && deleteScope !== "one") {
    const remaining = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.bookingSeriesId, existing.bookingSeriesId));
    if (remaining.length === 0) {
      await db.delete(bookingSeries).where(eq(bookingSeries.id, existing.bookingSeriesId));
    }
  }

  return NextResponse.json({ ok: true });
}
