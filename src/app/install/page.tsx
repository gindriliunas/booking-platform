import { redirect } from "next/navigation";
import { getGhlAuthUrl } from "@/lib/ghl/client";
import { randomBytes } from "crypto";

export default function InstallPage() {
  // Generate a CSRF state token (in a real app, persist it in a cookie/session)
  const state = randomBytes(16).toString("hex");
  const authUrl = getGhlAuthUrl(state);

  redirect(authUrl);
}
