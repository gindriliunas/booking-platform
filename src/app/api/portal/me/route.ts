import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPortalClient } from "@/lib/portal";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(session.email);
    if (!client) {
      return NextResponse.json({ error: "no_account" }, { status: 404 });
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        providerId: client.providerId,
      },
    });
  } catch (err) {
    console.error("GET /api/portal/me error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
