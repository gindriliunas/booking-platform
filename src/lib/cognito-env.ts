function trimEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/** Cognito settings from .env.local (supports Auth.js and legacy names). */
export function getCognitoEnv() {
  const clientId =
    trimEnv("AUTH_COGNITO_ID") ?? trimEnv("COGNITO_CLIENT_ID");
  const clientSecret =
    trimEnv("AUTH_COGNITO_SECRET") ?? trimEnv("COGNITO_CLIENT_SECRET");
  const issuer =
    trimEnv("AUTH_COGNITO_ISSUER") ?? trimEnv("COGNITO_ISSUER");
  const domain =
    trimEnv("COGNITO_DOMAIN") ?? trimEnv("AUTH_COGNITO_DOMAIN");

  return { clientId, clientSecret, issuer, domain };
}

export function isCognitoEnabled(): boolean {
  const { clientId, clientSecret, issuer } = getCognitoEnv();
  return !!(clientId && clientSecret && issuer);
}

export function getAppBaseUrl(): string {
  return (
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function getMissingCognitoEnv(): string[] {
  const { clientId, clientSecret, issuer } = getCognitoEnv();
  const missing: string[] = [];
  if (!clientId) missing.push("AUTH_COGNITO_ID or COGNITO_CLIENT_ID");
  if (!clientSecret) missing.push("AUTH_COGNITO_SECRET or COGNITO_CLIENT_SECRET");
  if (!issuer) missing.push("AUTH_COGNITO_ISSUER or COGNITO_ISSUER");
  return missing;
}
