export function vercelConfigured() {
  return Boolean(process.env.VERCEL_TOKEN?.trim());
}

export function vercelSetupMessage() {
  return "Vercel integration not configured. Set VERCEL_TOKEN (and optionally VERCEL_TEAM_ID) in the server environment.";
}

export async function deployToVercel(input: {
  name: string;
  files: Record<string, string>;
}) {
  const token = process.env.VERCEL_TOKEN?.trim();
  if (!token) {
    throw new Error(vercelSetupMessage());
  }
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  const query = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  const body = {
    name: input.name.slice(0, 80),
    project: input.name.slice(0, 80),
    files: Object.entries(input.files).map(([file, data]) => ({
      file,
      data: Buffer.from(data).toString("base64"),
      encoding: "base64",
    })),
  };
  const res = await fetch(`https://api.vercel.com/v13/deployments${query}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    url?: string;
    id?: string;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(json.error?.message || `Vercel deploy failed (${res.status})`);
  }
  if (!json.url) throw new Error("Vercel did not return a deployment URL");
  return { url: json.url.startsWith("http") ? json.url : `https://${json.url}`, id: json.id };
}
