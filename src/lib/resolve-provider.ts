import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** Resolve the provider row for the current session (by id, then email). */
export async function resolveProviderId(session: {
  uid: string;
  email: string | null;
}): Promise<string | null> {
  const [byId] = await db
    .select({ id: providers.id })
    .from(providers)
    .where(eq(providers.id, session.uid));

  if (byId) return byId.id;

  if (session.email) {
    const [byEmail] = await db
      .select({ id: providers.id })
      .from(providers)
      .where(eq(providers.email, session.email.toLowerCase()));
    if (byEmail) return byEmail.id;
  }

  return null;
}
