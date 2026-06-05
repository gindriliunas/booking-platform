import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { getMissingCognitoEnv } from "@/lib/cognito-env";

const MESSAGES: Record<string, { title: string; body: string }> = {
  Configuration: {
    title: "Authentication configuration error",
    body: "The server could not complete sign-in. This usually means Cognito environment variables are missing or the dev server needs a restart after updating .env.local.",
  },
  AccessDenied: {
    title: "Access denied",
    body: "You do not have permission to sign in with this account.",
  },
  Verification: {
    title: "Sign-in link expired",
    body: "This sign-in link is no longer valid. Please try again.",
  },
  default: {
    title: "Sign-in error",
    body: "Something went wrong during sign-in. Please try again.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error = "default" } = await searchParams;
  const info = MESSAGES[error] ?? MESSAGES.default;
  const missingCognito = error === "Configuration" ? getMissingCognitoEnv() : [];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <CalendarDays className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{info.title}</h1>
        <p className="max-w-md text-sm text-gray-600">{info.body}</p>
        {missingCognito.length > 0 && (
          <ul className="mt-2 max-w-md text-left text-sm text-gray-700 list-disc pl-5">
            {missingCognito.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        )}
      </div>
      <Link
        href="/"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Back to sign in
      </Link>
    </div>
  );
}
