import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInPage } from "@/components/sign-in-page";

const AUTH_ERRORS: Record<string, string> = {
  OAuthCallbackError:
    "Cognito sign-in failed. Enable openid and email scopes on your app client, or check the server log for invalid_scope.",
  Configuration:
    "Authentication is not configured correctly. Check Cognito env vars in .env.local.",
  AccessDenied: "Access denied.",
  default: "Sign-in failed. Please try again.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;
  const redirectTo =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
  const authError = error ? (AUTH_ERRORS[error] ?? AUTH_ERRORS.default) : undefined;

  if (session?.user?.id) {
    redirect(redirectTo);
  }

  return <SignInPage redirectTo={redirectTo} authError={authError} />;
}
