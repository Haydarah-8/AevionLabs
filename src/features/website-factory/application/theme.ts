import type { ThemeTokens } from "../types";
import { getWebsite, updateWebsite } from "./website";

export async function getTheme(projectId: string): Promise<ThemeTokens | null> {
  const project = await getWebsite(projectId);
  return project?.project.theme ?? null;
}

export async function updateTheme(
  projectId: string,
  theme: Partial<ThemeTokens>,
  actorId?: string | null,
) {
  const bundle = await getWebsite(projectId);
  if (!bundle) throw Object.assign(new Error("Website not found"), { status: 404 });
  return updateWebsite(
    projectId,
    {
      theme: {
        ...bundle.project.theme,
        ...theme,
      },
    },
    actorId,
  );
}
