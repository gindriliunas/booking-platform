import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config for middleware only.
 * OAuth providers are registered in auth.ts (Node.js) so secrets stay off the Edge bundle.
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
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
} satisfies NextAuthConfig;
