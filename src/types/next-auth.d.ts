import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    authProvider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    providerId?: string;
    authProvider?: string;
  }
}
