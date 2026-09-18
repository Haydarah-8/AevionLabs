import {
  getProjectBundle,
  recordDeployment,
  updateProject,
} from "../services/store";
import { buildExportZip } from "../export/zip";
import {
  deployToVercel,
  vercelConfigured,
  vercelSetupMessage,
} from "../deployment/vercel";
import { emitFactoryEvent } from "./events";

export type DeploymentProvider = {
  id: string;
  configured: () => boolean;
  setupMessage: () => string;
  deploy: (input: {
    name: string;
    files: Record<string, string>;
  }) => Promise<{ url: string; id?: string }>;
  /** Optional domain configure — wraps honest DNS verify; never fakes live. */
  configureDomain?: (input: {
    projectId: string;
    hostname?: string;
  }) => Promise<{ verified: boolean; hostname: string; detail: string; status: string }>;
};

async function verifyDomainHonest(input: {
  projectId: string;
  hostname?: string;
}) {
  const { promises: dns } = await import("dns");
  const { getSiteUrl } = await import("@/lib/site");
  const bundle = await getProjectBundle(input.projectId);
  if (!bundle) throw new Error("Project not found");
  const domain =
    bundle.domains.find((item) => item.hostname === input.hostname) ??
    bundle.domains[0];
  if (!domain) throw new Error("No domain to verify");
  const expected = getSiteUrl().replace(/^https?:\/\//, "");
  let verified = false;
  let detail = "";
  try {
    const cname = await dns.resolveCname(domain.hostname);
    verified = cname.some((value) =>
      value.replace(/\.$/, "").includes(expected),
    );
    detail = cname.join(", ");
  } catch {
    try {
      const txt = await dns.resolveTxt(`_aevion-verify.${domain.hostname}`);
      verified = txt.flat().some((value) => value.includes(bundle.project.slug));
      detail = txt.flat().join(" ");
    } catch (err) {
      detail = err instanceof Error ? err.message : "DNS lookup failed";
    }
  }
  return {
    verified,
    hostname: domain.hostname,
    detail,
    status: verified ? "verified" : "failed",
  };
}

export const vercelDeploymentProvider: DeploymentProvider = {
  id: "vercel",
  configured: vercelConfigured,
  setupMessage: vercelSetupMessage,
  deploy: deployToVercel,
  configureDomain: verifyDomainHonest,
};

export function getDeploymentProvider(id = "vercel"): DeploymentProvider {
  if (id === "vercel") return vercelDeploymentProvider;
  throw new Error(`Unknown deployment provider: ${id}`);
}

export async function configureWebsiteDomain(
  projectId: string,
  hostname?: string,
) {
  const provider = getDeploymentProvider();
  if (!provider.configureDomain) {
    throw new Error("Provider does not support domain configure");
  }
  return provider.configureDomain({ projectId, hostname });
}

export async function getDeploymentStatus() {
  const provider = getDeploymentProvider();
  return {
    configured: provider.configured(),
    message: provider.configured() ? "" : provider.setupMessage(),
    provider: provider.id,
  };
}

export async function deployWebsite(
  projectId: string,
  actorId?: string | null,
) {
  const provider = getDeploymentProvider();
  if (!provider.configured()) {
    throw new Error(provider.setupMessage());
  }

  await emitFactoryEvent({
    name: "deployment.started",
    projectId,
    resourceType: "deployment",
    resourceId: projectId,
    actorId,
  });

  try {
    const bundle = await getProjectBundle(projectId);
    if (!bundle) throw new Error("Project not found");
    const { files } = await buildExportZip(bundle);
    const result = await provider.deploy({
      name: bundle.project.slug,
      files,
    });
    await recordDeployment({
      projectId,
      versionId: bundle.project.publishedVersionId,
      provider: provider.id,
      status: "live",
      url: result.url,
    });
    await updateProject(projectId, {
      deploymentProvider: provider.id,
      deploymentStatus: "live",
      deploymentUrl: result.url,
    });
    await emitFactoryEvent({
      name: "deployment.completed",
      projectId,
      resourceType: "deployment",
      resourceId: projectId,
      actorId,
      meta: { url: result.url },
    });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deploy failed";
    await recordDeployment({
      projectId,
      provider: provider.id,
      status: "error",
      error: message,
    });
    const bundle = await getProjectBundle(projectId);
    await updateProject(projectId, {
      deploymentStatus: "error",
      ...(bundle?.project.status === "published"
        ? {}
        : { status: "deployment_error" }),
    });
    await emitFactoryEvent({
      name: "deployment.failed",
      projectId,
      resourceType: "deployment",
      resourceId: projectId,
      actorId,
      result: "error",
      meta: { error: message },
    });
    throw err;
  }
}

export async function exportWebsiteZip(projectId: string, actorId?: string | null) {
  const bundle = await getProjectBundle(projectId);
  if (!bundle) throw new Error("Project not found");
  const zip = await buildExportZip(bundle);
  await emitFactoryEvent({
    name: "export.completed",
    projectId,
    resourceType: "export",
    resourceId: projectId,
    actorId,
  });
  return zip;
}
