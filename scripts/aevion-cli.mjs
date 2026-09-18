#!/usr/bin/env node
/**
 * Minimal Aevion CLI — maps to real /api/v1 endpoints only.
 *
 * Usage:
 *   AEVION_API_KEY=ae_live_... AEVION_HOST=http://localhost:3005 \
 *     node scripts/aevion-cli.mjs websites list
 *   node scripts/aevion-cli.mjs websites create --name "Acme" --template service-local
 *   node scripts/aevion-cli.mjs export <websiteId>
 *   node scripts/aevion-cli.mjs deploy <websiteId>
 */

const host = (process.env.AEVION_HOST || "http://localhost:3005").replace(/\/$/, "");
const key = process.env.AEVION_API_KEY || "";

async function api(path, init) {
  if (!key) {
    console.error("Set AEVION_API_KEY to an ae_live_ key");
    process.exit(1);
  }
  const res = await fetch(`${host}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(json.error?.message || json.error || `HTTP ${res.status}`);
    process.exit(1);
  }
  return json.data ?? json;
}

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const [, , cmd, sub, id] = process.argv;

  if (cmd === "websites" && sub === "list") {
    const data = await api("/api/v1/websites");
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (cmd === "websites" && sub === "create") {
    const name = arg("--name") || "New website";
    const templateId = arg("--template") || "service-local";
    const businessName = arg("--business") || name;
    const data = await api("/api/v1/websites", {
      method: "POST",
      body: JSON.stringify({
        wizard: { name, templateId, businessName },
      }),
    });
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (cmd === "export" && sub) {
    const res = await fetch(`${host}/api/v1/websites/${sub}/export`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      console.error(json.error?.message || `HTTP ${res.status}`);
      process.exit(1);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const out = arg("--out") || `aevion-export-${sub}.zip`;
    const fs = await import("node:fs/promises");
    await fs.writeFile(out, buf);
    console.log(`Wrote ${out} (${buf.length} bytes)`);
    return;
  }

  if (cmd === "deploy" && sub) {
    const data = await api(`/api/v1/websites/${sub}/deploy`, { method: "POST" });
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.log(`Aevion CLI

Commands:
  websites list
  websites create --name <n> [--template <id>] [--business <n>]
  export <websiteId> [--out file.zip]
  deploy <websiteId>

Env:
  AEVION_HOST   (default http://localhost:3005)
  AEVION_API_KEY
`);
  if (cmd) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
