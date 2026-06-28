import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/session";
import { AuthPageShell } from "@/components/auth-page-shell";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getSafeSession();
  const { callbackUrl } = await searchParams;
  const redirectTo =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  if (session?.user?.id) {
    redirect(redirectTo);
  }

  return <AuthPageShell mode="signup" redirectTo={redirectTo} />;
}
