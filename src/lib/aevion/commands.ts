/**
 * Unified Aevion command / service façade.
 * UI, API routes, and MCP should prefer these entry points over ad-hoc store calls.
 * All commands delegate to existing website-factory application services — no second backend.
 */

import {
  createBlankWebsite,
  createWebsiteFromWizard,
  duplicateWebsite,
  getWebsite,
  listWebsites,
  publishWebsiteLive,
  publishWebsitePreview,
  regenerateWebsite,
  restoreWebsiteVersion,
  updateWebsite,
} from "@/features/website-factory/application/website";
import {
  createWebsitePage,
  duplicateWebsitePage,
  listWebsitePages,
  removeWebsitePage,
  updateWebsitePage,
} from "@/features/website-factory/application/page";
import {
  addPageComponent,
  listComponentSchemas,
  listPageComponents,
  movePageComponent,
  removePageComponent,
  updatePageComponent,
} from "@/features/website-factory/application/components";
import { getTheme, updateTheme } from "@/features/website-factory/application/theme";
import { listProjectAssets } from "@/features/website-factory/application/asset";
import {
  deployWebsite,
  exportWebsiteZip,
  getDeploymentStatus,
} from "@/features/website-factory/application/deployment";
import {
  applyWebsiteScrape,
  getWebsiteScrapeJob,
  listWebsiteScrapeJobs,
  startWebsiteScrape,
} from "@/features/website-factory/application/scrape";
import { emitFactoryEvent } from "@/features/website-factory/application/events";
import { emitEditorEvent } from "@/lib/editor/editor-events";
import type { EditorEngineKind } from "@/features/website-factory/types";

export type AevionCommandContext = {
  actorId?: string | null;
};

export const aevionCommands = {
  // —— Websites ——
  listWebsites,
  getWebsite,
  async createWebsite(
    input: {
      name?: string;
      templateId?: string;
      editorEngine?: EditorEngineKind;
      wizard?: Record<string, unknown>;
    } = {},
    ctx: AevionCommandContext = {},
  ) {
    if (input.wizard) {
      return createWebsiteFromWizard(input.wizard as never, ctx.actorId);
    }
    return createBlankWebsite(
      {
        name: input.name,
        templateId: input.templateId,
        editorEngine: input.editorEngine,
      },
      ctx.actorId,
    );
  },
  updateWebsite,
  duplicateWebsite,
  regenerateWebsite,
  publishWebsitePreview,
  publishWebsiteLive,
  restoreWebsiteVersion,

  // —— Pages ——
  listWebsitePages,
  createWebsitePage,
  updateWebsitePage,
  removeWebsitePage,
  duplicateWebsitePage,

  // —— Components (Puck-structured page documents) ——
  listComponentSchemas,
  listPageComponents,
  addPageComponent,
  updatePageComponent,
  removePageComponent,
  movePageComponent,

  // —— Theme / assets / deploy / scrape ——
  getTheme,
  updateTheme,
  listProjectAssets,
  getDeploymentStatus,
  deployWebsite,
  exportWebsiteZip,
  startWebsiteScrape,
  getWebsiteScrapeJob,
  listWebsiteScrapeJobs,
  applyWebsiteScrape,

  // —— Events ——
  emitFactoryEvent,
  emitEditorEvent,
} as const;

export type AevionCommandName = keyof typeof aevionCommands;
