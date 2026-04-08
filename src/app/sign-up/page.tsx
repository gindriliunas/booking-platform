import { SignUpForm } from "@/components/sign-up-form";

export default function BusinessSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUpForm redirectTo="/setup" signInHref="/sign-in" />
    </div>
  );
}
