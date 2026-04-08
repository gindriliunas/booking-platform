import { SignUpForm } from "@/components/sign-up-form";

export default function PortalSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUpForm redirectTo="/portal" signInHref="/portal/sign-in" />
    </div>
  );
}
