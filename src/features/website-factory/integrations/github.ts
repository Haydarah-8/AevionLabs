import { getIntegration } from "../application/integrations";
import { exportWebsiteZip } from "../application/deployment";
import { emitFactoryEvent } from "../application/events";

/**
 * Export project files and open a GitHub PR when OAuth is connected.
 * Commits the full export file map (not README-only).
 */
export async function exportToGithubPullRequest(input: {
  projectId: string;
  owner: string;
  repo: string;
  branch?: string;
  actorId?: string | null;
}) {
  const integration = await getIntegration("github");
  if (!integration || integration.status !== "connected") {
    throw new Error(
      "GitHub is not connected. Connect OAuth at /admin/developer/integrations first.",
    );
  }

  const token =
    process.env.GITHUB_TOKEN?.trim() ||
    (await loadGithubToken());

  if (!token) {
    throw new Error(
      "GitHub connected but no access token available. Reconnect OAuth or set GITHUB_TOKEN.",
    );
  }

  const zip = await exportWebsiteZip(input.projectId, input.actorId);
  const files = zip.files || {};
  const fileEntries = Object.entries(files);
  if (!fileEntries.length) {
    throw new Error("Export produced no files");
  }

  const branch = input.branch || `aevion-export-${Date.now()}`;
  const base = "main";
  const root = `aevion-export/${input.projectId}`;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "AevionWebsiteFactory",
    "Content-Type": "application/json",
  };

  const refRes = await fetch(
    `https://api.github.com/repos/${input.owner}/${input.repo}/git/ref/heads/${base}`,
    { headers },
  );
  if (!refRes.ok) {
    throw new Error(
      `Could not read ${base} on ${input.owner}/${input.repo} (${refRes.status}). Check repo access.`,
    );
  }
  const ref = (await refRes.json()) as { object: { sha: string } };

  const branchRes = await fetch(
    `https://api.github.com/repos/${input.owner}/${input.repo}/git/refs`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: ref.object.sha,
      }),
    },
  );
  if (!branchRes.ok && branchRes.status !== 422) {
    throw new Error(`Could not create branch (${branchRes.status})`);
  }

  for (const [relPath, contents] of fileEntries) {
    const path = `${root}/${relPath}`.replace(/\\/g, "/");
    const content = Buffer.from(contents, "utf8").toString("base64");
    const putRes = await fetch(
      `https://api.github.com/repos/${input.owner}/${input.repo}/contents/${path}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `chore: aevion export ${input.projectId} — ${relPath}`,
          content,
          branch,
        }),
      },
    );
    if (!putRes.ok) {
      const body = await putRes.text().catch(() => "");
      throw new Error(
        `Could not commit ${relPath} (${putRes.status})${body ? `: ${body.slice(0, 200)}` : ""}`,
      );
    }
  }

  const prRes = await fetch(
    `https://api.github.com/repos/${input.owner}/${input.repo}/pulls`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: `Aevion export ${input.projectId}`,
        head: branch,
        base,
        body: `Automated full-site export from Aevion Website Factory (${fileEntries.length} files).`,
      }),
    },
  );
  if (!prRes.ok) {
    throw new Error(`Could not open PR (${prRes.status})`);
  }
  const pr = (await prRes.json()) as { html_url?: string; number?: number };

  await emitFactoryEvent({
    name: "export.completed",
    projectId: input.projectId,
    resourceType: "github_pr",
    resourceId: String(pr.number || branch),
    actorId: input.actorId,
    meta: {
      url: pr.html_url,
      owner: input.owner,
      repo: input.repo,
      files: fileEntries.length,
    },
  });

  return {
    url: pr.html_url,
    branch,
    number: pr.number,
    files: fileEntries.length,
  };
}

async function loadGithubToken(): Promise<string | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.join(process.cwd(), "data", "factory-integrations.json");
    const items = JSON.parse(await readFile(file, "utf8")) as Array<{
      provider: string;
      encryptedCredentials?: string;
    }>;
    const github = items.find((item) => item.provider === "github");
    return github?.encryptedCredentials || null;
  } catch {
    return null;
  }
}
