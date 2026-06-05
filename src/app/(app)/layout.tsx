import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { resolveProviderId } from "@/lib/resolve-provider";
import { DashboardShell } from "./dashboard-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isSetupPage = pathname.startsWith("/setup");

  const providerId = await resolveProviderId(session);
  if (!providerId && !isSetupPage) redirect("/setup");

  return <DashboardShell>{children}</DashboardShell>;
}
