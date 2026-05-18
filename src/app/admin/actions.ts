"use server";

import { db } from "@/lib/db";
import { websiteClients, partnerSpots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createWebsiteClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const businessName = formData.get("businessName") as string;
  const businessType = formData.get("businessType") as string;
  const brandColours = (formData.get("brandColours") as string) || "TBD";
  const description = (formData.get("description") as string) || "TBD";
  const previewUrl = (formData.get("previewUrl") as string) || null;
  const customDomain = (formData.get("customDomain") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const status = (formData.get("status") as "building" | "preview_live" | "active" | "suspended" | "cancelled") || "building";

  if (!name || !email || !businessName || !businessType) {
    throw new Error("Name, email, business name and business type are required.");
  }

  await db.insert(websiteClients).values({
    name,
    email,
    phone,
    businessName,
    businessType,
    brandColours,
    description,
    previewUrl,
    customDomain,
    notes,
    status,
  });

  revalidatePath("/admin");
}

export async function updateWebsiteClient(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const businessName = formData.get("businessName") as string;
  const businessType = formData.get("businessType") as string;
  const previewUrl = (formData.get("previewUrl") as string) || null;
  const customDomain = (formData.get("customDomain") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const status = formData.get("status") as "building" | "preview_live" | "active" | "suspended" | "cancelled";

  if (!name || !email || !businessName || !businessType) {
    throw new Error("Name, email, business name and business type are required.");
  }

  await db
    .update(websiteClients)
    .set({ name, email, phone, businessName, businessType, previewUrl, customDomain, notes, status, updatedAt: new Date() })
    .where(eq(websiteClients.id, id));

  revalidatePath("/admin");
}

export async function upsertPartnerSpot(formData: FormData) {
  const position = parseInt(formData.get("position") as string, 10);
  const businessName = formData.get("businessName") as string;
  const logoUrl = (formData.get("logoUrl") as string) || null;
  const description = formData.get("description") as string;
  const visitUrl = formData.get("visitUrl") as string;

  if (!position || !businessName || !description || !visitUrl) {
    throw new Error("Position, business name, description and visit URL are required.");
  }

  const existing = await db
    .select({ id: partnerSpots.id })
    .from(partnerSpots)
    .where(eq(partnerSpots.position, position));

  if (existing.length > 0) {
    await db
      .update(partnerSpots)
      .set({ businessName, logoUrl, description, visitUrl, isActive: true, updatedAt: new Date() })
      .where(eq(partnerSpots.position, position));
  } else {
    await db.insert(partnerSpots).values({ position, businessName, logoUrl, description, visitUrl });
  }

  revalidatePath("/admin");
}

export async function clearPartnerSpot(position: number) {
  await db.delete(partnerSpots).where(eq(partnerSpots.position, position));
  revalidatePath("/admin");
}
