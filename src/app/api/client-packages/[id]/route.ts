import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientPackages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [deleted] = await db
    .delete(clientPackages)
    .where(eq(clientPackages.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Client package not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
