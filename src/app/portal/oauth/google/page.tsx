import { redirect } from "next/navigation";

export default function PortalGoogleOAuthPage() {
  redirect("/?callbackUrl=/portal");
}
