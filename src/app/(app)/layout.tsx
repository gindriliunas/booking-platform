import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DashboardShell } from "./dashboard-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [provider] = await db
    .select({ id: providers.id })
    .from(providers)
    .where(eq(providers.clerkUserId, userId));

  if (!provider) redirect("/portal");

  return <DashboardShell>{children}</DashboardShell>;
}
