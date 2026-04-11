import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { PortalFirebaseRedirectHandler } from "@/components/portal-firebase-redirect-handler";
import { PortalShell } from "@/components/portal-shell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isAuthPage =
    pathname.startsWith("/portal/sign-in") ||
    pathname.startsWith("/portal/sign-up") ||
    pathname.startsWith("/portal/oauth/");

  if (!session && !isAuthPage) redirect("/portal/sign-in");
  if (session && isAuthPage) redirect("/portal");
  if (isAuthPage)
    return (
      <>
        <PortalFirebaseRedirectHandler />
        {children}
      </>
    );

  return (
    <>
      <PortalFirebaseRedirectHandler />
      <PortalShell>{children}</PortalShell>
    </>
  );
}
