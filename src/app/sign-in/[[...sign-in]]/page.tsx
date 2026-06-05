import { redirect } from "next/navigation";

export default async function SignInRedirect({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  if (callbackUrl) {
    redirect(`/?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  redirect("/");
}
