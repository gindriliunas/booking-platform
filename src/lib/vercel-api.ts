const VERCEL_TOKEN = process.env.VERCEL_TOKEN!;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // optional, for team accounts

function vercelHeaders() {
  return {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function teamQuery() {
  return VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";
}

export async function suspendVercelProject(vercelProjectId: string) {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${vercelProjectId}${teamQuery()}`,
    {
      method: "PATCH",
      headers: vercelHeaders(),
      body: JSON.stringify({ passwordProtection: { deploymentType: "all" } }),
    }
  );
  if (!res.ok) throw new Error(`Vercel suspend failed: ${await res.text()}`);
}

export async function activateVercelProject(vercelProjectId: string) {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${vercelProjectId}${teamQuery()}`,
    {
      method: "PATCH",
      headers: vercelHeaders(),
      body: JSON.stringify({ passwordProtection: null }),
    }
  );
  if (!res.ok) throw new Error(`Vercel activate failed: ${await res.text()}`);
}

export async function addDomainToVercelProject(
  vercelProjectId: string,
  domain: string
) {
  const res = await fetch(
    `https://api.vercel.com/v10/projects/${vercelProjectId}/domains${teamQuery()}`,
    {
      method: "POST",
      headers: vercelHeaders(),
      body: JSON.stringify({ name: domain }),
    }
  );
  if (!res.ok) throw new Error(`Vercel add domain failed: ${await res.text()}`);
  return res.json();
}
