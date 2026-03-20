/**
 * GoHighLevel API client
 * Docs: https://highlevel.stoplight.io/docs/integrations
 */

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_AUTH_BASE = "https://marketplace.gohighlevel.com/oauth";

export const GHL_SCOPES = [
  "contacts.readonly",
  "contacts.write",
  "calendars.readonly",
  "calendars.write",
  "calendars/events.readonly",
  "calendars/events.write",
  "locations.readonly",
  "locations/customValues.readonly",
].join(" ");

// Build the GHL OAuth authorization URL for the install flow
export function getGhlAuthUrl(state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    redirect_uri: process.env.GHL_REDIRECT_URI!,
    client_id: process.env.GHL_CLIENT_ID!,
    scope: GHL_SCOPES,
    state,
  });
  return `${GHL_AUTH_BASE}/chooselocation?${params.toString()}`;
}

// Exchange auth code for tokens
export async function exchangeCodeForTokens(code: string) {
  const res = await fetch(`${GHL_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GHL_CLIENT_ID!,
      client_secret: process.env.GHL_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.GHL_REDIRECT_URI!,
    }),
  });
  if (!res.ok) throw new Error(`GHL token exchange failed: ${await res.text()}`);
  return res.json() as Promise<GhlTokenResponse>;
}

// Refresh an expired access token
export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${GHL_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GHL_CLIENT_ID!,
      client_secret: process.env.GHL_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`GHL token refresh failed: ${await res.text()}`);
  return res.json() as Promise<GhlTokenResponse>;
}

// Make an authenticated API call, auto-refreshing the token if needed
export async function ghlFetch(
  path: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${GHL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`GHL API error ${res.status}: ${await res.text()}`);
  return res.json();
}

// Get location info
export async function getLocation(locationId: string, accessToken: string) {
  return ghlFetch(`/locations/${locationId}`, accessToken);
}

// Get contacts for a location
export async function getContacts(
  locationId: string,
  accessToken: string,
  limit = 100,
  skip = 0
) {
  return ghlFetch(
    `/contacts/?locationId=${locationId}&limit=${limit}&skip=${skip}`,
    accessToken
  );
}

// Search contacts by name/email/phone
export async function searchContacts(
  locationId: string,
  accessToken: string,
  query: string
) {
  return ghlFetch(
    `/contacts/?locationId=${locationId}&query=${encodeURIComponent(query)}`,
    accessToken
  );
}

export interface GhlTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  locationId?: string;
  companyId?: string;
}
