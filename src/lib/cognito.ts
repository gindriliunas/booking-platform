import { getAppBaseUrl, getCognitoEnv, isCognitoEnabled } from "@/lib/cognito-env";

export { getAppBaseUrl, isCognitoEnabled };

/**
 * Cognito hosted UI logout URL.
 * @see https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
 */
export function getCognitoLogoutUrl(logoutUri: string): string | null {
  const { domain, clientId } = getCognitoEnv();
  if (!domain || !clientId) return null;

  const base = domain.replace(/\/$/, "");
  const params = new URLSearchParams({
    client_id: clientId,
    logout_uri: logoutUri,
  });
  return `${base}/logout?${params.toString()}`;
}
