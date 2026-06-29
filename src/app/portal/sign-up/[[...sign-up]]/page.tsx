import { redirect } from "next/navigation";

export default async function PortalSignUpRedirect({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const params = new URLSearchParams();
  params.set("callbackUrl", callbackUrl?.startsWith("/") ? callbackUrl : "/portal");
  redirect(`/sign-up?${params.toString()}`);
}
