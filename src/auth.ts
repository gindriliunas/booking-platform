import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Cognito from "next-auth/providers/cognito";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { getCognitoEnv, getMissingCognitoEnv, isCognitoEnabled } from "@/lib/cognito-env";

function createCognitoProvider(options: { id: string; signup?: boolean }): Provider {
  const { clientId, clientSecret, issuer, domain } = getCognitoEnv();
  const scopeParams = { scope: "openid email" };

  const authorization =
    options.signup && domain
      ? {
          url: `${domain.replace(/\/$/, "")}/signup`,
          params: scopeParams,
        }
      : { params: scopeParams };

  return Cognito({
    id: options.id,
    name: options.signup ? "Cognito Sign Up" : "Cognito",
    clientId: clientId!,
    clientSecret: clientSecret!,
    issuer: issuer!,
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    authorization,
  });
}

function buildProviders(): Provider[] {
  const list: Provider[] = [];

  if (isCognitoEnabled()) {
    list.push(createCognitoProvider({ id: "cognito" }));
    list.push(createCognitoProvider({ id: "cognito-signup", signup: true }));
  } else if (process.env.NODE_ENV === "development") {
    const missing = getMissingCognitoEnv();
    if (missing.length > 0 && missing.length < 3) {
      console.warn(
        "[auth] Cognito partially configured; missing:",
        missing.join(", "),
      );
    }
  }

  list.push(
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase();
        const [provider] = await db
          .select({
            id: providers.id,
            email: providers.email,
            name: providers.name,
            passwordHash: providers.passwordHash,
          })
          .from(providers)
          .where(eq(providers.email, email));

        if (!provider?.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          provider.passwordHash,
        );
        if (!valid) return null;

        return { id: provider.id, email: provider.email!, name: provider.name };
      },
    }),
  );

  if (process.env.NODE_ENV === "development") {
    console.log(
      "[auth] providers:",
      list.map((p) => ("id" in p ? p.id : "credentials")),
    );
  }

  return list;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: buildProviders(),
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      const cognitoProvider =
        account?.provider === "cognito" || account?.provider === "cognito-signup";
      if (!cognitoProvider) return true;

      const email = (user.email ?? profile?.email)?.toString().toLowerCase();
      if (!email) return false;

      const [provider] = await db
        .select({ id: providers.id })
        .from(providers)
        .where(eq(providers.email, email));

      if (provider) user.id = provider.id;
      return true;
    },
    jwt({ token, user, account }) {
      if (user) {
        token.providerId = user.id;
        token.authProvider = account?.provider ?? "credentials";
      }
      return token;
    },
    session({ session, token }) {
      if (token.providerId) session.user.id = token.providerId as string;
      if (token.authProvider) {
        session.authProvider = token.authProvider as string;
      }
      return session;
    },
  },
});
