import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { adminAuth } from "@/lib/firebase/admin";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DashboardShell } from "./dashboard-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isSetupPage = pathname.startsWith("/setup");

  // Fast path: look up provider by Firebase UID
  let [provider] = await db
    .select({ id: providers.id })
    .from(providers)
    .where(eq(providers.firebaseUid, session.uid));

  // First sign-in after migration: try to link existing provider by email
  if (!provider && !isSetupPage) {
    const firebaseUser = await adminAuth.getUser(session.uid).catch(() => null);
    const email = firebaseUser?.email;
    if (email) {
      const [byEmail] = await db
        .select({ id: providers.id })
        .from(providers)
        .where(eq(providers.email, email));
      if (byEmail) {
        await db
          .update(providers)
          .set({ firebaseUid: session.uid })
          .where(eq(providers.id, byEmail.id));
        provider = byEmail;
      }
    }
  }

  if (!provider && !isSetupPage) redirect("/setup");

  return <DashboardShell>{children}</DashboardShell>;
}
