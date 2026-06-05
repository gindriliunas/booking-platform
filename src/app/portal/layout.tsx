import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PortalShell } from "@/components/portal-shell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/?callbackUrl=/portal");

  return <PortalShell>{children}</PortalShell>;
}
