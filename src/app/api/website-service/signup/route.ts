import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { sendAdminBuildNotification } from "@/lib/email/website-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, phone, businessName, businessType,
      brandColours, hasLogo, logoUrl, description,
      referralSource, preferredStyle,
    } = body;

    if (!name || !email || !businessName || !businessType || !brandColours || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [client] = await db
      .insert(websiteClients)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        businessName: businessName.trim(),
        businessType,
        brandColours: brandColours.trim(),
        hasLogo: !!hasLogo,
        logoUrl: logoUrl?.trim() || null,
        description: description.trim(),
        referralSource: referralSource || null,
        preferredStyle: preferredStyle || "clean_minimal",
        status: "building",
      })
      .returning();

    // Notify admin with pre-built Claude Code prompt (non-blocking)
    sendAdminBuildNotification(client).catch((err) =>
      console.error("[website-service] Admin email failed:", err)
    );

    return NextResponse.json({ id: client.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/website-service/signup error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
