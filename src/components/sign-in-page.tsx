import { AuthPageShell } from "@/components/auth-page-shell";

interface SignInPageProps {
  redirectTo: string;
  authError?: string;
}

export function SignInPage({ redirectTo, authError }: SignInPageProps) {
  return (
    <AuthPageShell
      mode="signin"
      redirectTo={redirectTo}
      authError={authError}
    />
  );
}
