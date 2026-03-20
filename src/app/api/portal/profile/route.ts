import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [client] = await db.select().from(clients).where(eq(clients.clerkUserId, userId));
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { name, phone } = await req.json();

  const [updated] = await db
    .update(clients)
    .set({
      name: name ?? client.name,
      phone: phone ?? null,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, client.id))
    .returning();

  return NextResponse.json({ client: updated });
}
