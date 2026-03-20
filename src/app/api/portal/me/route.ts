import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getPortalClient } from "@/lib/portal";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await getPortalClient(userId);
    if (!client) {
      let clerkEmail: string | undefined;
      try {
        const clerkUser = await currentUser();
        clerkEmail = clerkUser?.emailAddresses?.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress;
      } catch {
        // non-fatal
      }
      return NextResponse.json({ error: "no_account", clerkEmail }, { status: 404 });
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        stripeCustomerId: client.stripeCustomerId,
        providerId: client.providerId,
      },
    });
  } catch (err) {
    console.error("GET /api/portal/me error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
