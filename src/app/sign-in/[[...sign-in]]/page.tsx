import { SignInForm } from "@/components/sign-in-form";

export default function BusinessSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignInForm redirectTo="/dashboard" signUpHref="/sign-up" />
    </div>
  );
}
