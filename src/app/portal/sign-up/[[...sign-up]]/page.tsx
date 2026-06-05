import { redirect } from "next/navigation";

export default function PortalSignUpRedirect() {
  redirect("/?callbackUrl=/portal");
}
