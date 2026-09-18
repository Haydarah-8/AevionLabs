/**
 * CMS for scraped website intelligence — durable store of imports,
 * pages, media, and provenance independent of ephemeral scrape jobs.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isMissingTable } from "../services/persistence";
import type { IntelligenceResult } from "../intelligence/types";

export type ScrapeCmsRecord = {
  id: string;
  projectId: string | null;
  jobId: string | null;
  sourceUrl: string;
  status: "imported" | "applied" | "archived";
  title: string;
  summary: string;
  pageCount: number;
  assetCount: number;
  serviceCount: number;
  result: IntelligenceResult;
  createdAt: string;
  updatedAt: string;
  appliedAt: string | null;
};

const FILE = path.join(process.cwd(), "data", "factory-scrape-cms.json");

async function loadFile(): Promise<ScrapeCmsRecord[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as ScrapeCmsRecord[];
  } catch {
    return [];
  }
}

async function saveFile(items: ScrapeCmsRecord[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(items.slice(0, 200), null, 2), "utf8");
}

function fromRow(row: Record<string, unknown>): ScrapeCmsRecord {
  return {
    id: String(row.id),
    projectId: row.project_id ? String(row.project_id) : null,
    jobId: row.job_id ? String(row.job_id) : null,
    sourceUrl: String(row.source_url ?? ""),
    status: (row.status as ScrapeCmsRecord["status"]) || "imported",
    title: String(row.title ?? ""),
    summary: String(row.summary ?? ""),
    pageCount: Number(row.page_count ?? 0),
    assetCount: Number(row.asset_count ?? 0),
    serviceCount: Number(row.service_count ?? 0),
    result: (row.result as IntelligenceResult) || ({} as IntelligenceResult),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    appliedAt: row.applied_at ? String(row.applied_at) : null,
  };
}

export async function saveScrapeImport(input: {
  projectId?: string | null;
  jobId?: string | null;
  sourceUrl: string;
  result: IntelligenceResult;
}): Promise<ScrapeCmsRecord> {
  const now = new Date().toISOString();
  const record: ScrapeCmsRecord = {
    id: crypto.randomUUID(),
    projectId: input.projectId ?? null,
    jobId: input.jobId ?? null,
    sourceUrl: input.sourceUrl,
    status: "imported",
    title: input.result.name || input.sourceUrl,
    summary: input.result.tagline || input.result.description.slice(0, 240),
    pageCount: input.result.pages.length,
    assetCount: input.result.images.length,
    serviceCount: input.result.services.length,
    result: input.result,
    createdAt: now,
    updatedAt: now,
    appliedAt: null,
  };

  try {
    const { error } = await getSupabaseAdmin()
      .from("factory_scrape_imports")
      .insert({
        id: record.id,
        project_id: record.projectId,
        job_id: record.jobId,
        source_url: record.sourceUrl,
        status: record.status,
        title: record.title,
        summary: record.summary,
        page_count: record.pageCount,
        asset_count: record.assetCount,
        service_count: record.serviceCount,
        result: record.result,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
      });
    if (error) {
      if (!isMissingTable(error)) console.error("[cms] supabase", error.message);
      const items = await loadFile();
      items.unshift(record);
      await saveFile(items);
    }
  } catch (err) {
    if (!isMissingTable(err)) console.error("[cms] save failed", err);
    const items = await loadFile();
    items.unshift(record);
    await saveFile(items);
  }

  return record;
}

export async function listScrapeImports(projectId?: string, limit = 40) {
  try {
    let query = getSupabaseAdmin()
      .from("factory_scrape_imports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (!error && data) return data.map((row) => fromRow(row as never));
  } catch {
    /* fall through */
  }
  const items = await loadFile();
  const filtered = projectId
    ? items.filter((item) => item.projectId === projectId)
    : items;
  return filtered.slice(0, limit);
}

export async function getScrapeImport(id: string) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("factory_scrape_imports")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!error && data) return fromRow(data as never);
  } catch {
    /* fall through */
  }
  return (await loadFile()).find((item) => item.id === id) ?? null;
}

export async function markScrapeImportApplied(id: string) {
  const appliedAt = new Date().toISOString();
  try {
    const { error } = await getSupabaseAdmin()
      .from("factory_scrape_imports")
      .update({ status: "applied", applied_at: appliedAt, updated_at: appliedAt })
      .eq("id", id);
    if (error && !isMissingTable(error)) throw new Error(error.message);
  } catch {
    /* file fallback */
  }
  const items = await loadFile();
  const next = items.map((item) =>
    item.id === id
      ? { ...item, status: "applied" as const, appliedAt, updatedAt: appliedAt }
      : item,
  );
  await saveFile(next);
  return next.find((item) => item.id === id) ?? null;
}

export async function archiveScrapeImport(id: string) {
  const updatedAt = new Date().toISOString();
  try {
    await getSupabaseAdmin()
      .from("factory_scrape_imports")
      .update({ status: "archived", updated_at: updatedAt })
      .eq("id", id);
  } catch {
    /* ignore */
  }
  const items = await loadFile();
  await saveFile(
    items.map((item) =>
      item.id === id
        ? { ...item, status: "archived" as const, updatedAt }
        : item,
    ),
  );
}
