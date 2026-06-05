import { SignInForm } from "@/components/sign-in-form";
import { isCognitoEnabled } from "@/lib/cognito";
import { CalendarDays } from "lucide-react";

interface SignInPageProps {
  redirectTo: string;
  authError?: string;
}

export function SignInPage({ redirectTo, authError }: SignInPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <CalendarDays className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Booking Platform</h1>
        <p className="text-sm text-gray-500">Sign in to manage your calendar and clients</p>
      </div>
      {authError && (
        <div className="mb-4 w-full max-w-sm rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {authError}
        </div>
      )}
      <SignInForm redirectTo={redirectTo} cognitoEnabled={isCognitoEnabled()} />
    </div>
  );
}
