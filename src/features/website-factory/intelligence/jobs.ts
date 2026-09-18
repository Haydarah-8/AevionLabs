import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IntelligenceResult } from "./types";

export type ScrapeJob = {
  id: string;
  url: string;
  projectId?: string;
  status: "queued" | "running" | "succeeded" | "failed";
  step: string;
  pages: number;
  assets: number;
  error: string | null;
  result: IntelligenceResult | null;
  createdAt: string;
  updatedAt: string;
};

const FILE = path.join(process.cwd(), "data", "website-factory-jobs.json");
const memory = new Map<string, ScrapeJob>();
const running = new Set<string>();
let writeChain: Promise<void> = Promise.resolve();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushPending = false;

async function loadDisk(): Promise<ScrapeJob[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as ScrapeJob[];
  } catch {
    return [];
  }
}

function enqueueFlush(immediate = false) {
  flushPending = true;
  if (immediate) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    writeChain = writeChain.then(async () => {
      if (!flushPending) return;
      flushPending = false;
      const jobs = [...memory.values()].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );
      await mkdir(path.dirname(FILE), { recursive: true });
      await writeFile(FILE, JSON.stringify(jobs.slice(0, 40), null, 2), "utf8");
    });
    return;
  }
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    enqueueFlush(true);
  }, 200);
}

async function flushNow() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  enqueueFlush(true);
  await writeChain;
}

async function hydrate(id?: string) {
  if (id && memory.has(id)) return;
  const disk = await loadDisk();
  for (const job of disk) {
    if (!memory.has(job.id)) memory.set(job.id, job);
  }
}

export async function createScrapeJob(url: string, projectId?: string) {
  await hydrate();
  const now = new Date().toISOString();
  const job: ScrapeJob = {
    id: crypto.randomUUID(),
    url,
    projectId,
    status: "queued",
    step: "Queued",
    pages: 0,
    assets: 0,
    error: null,
    result: null,
    createdAt: now,
    updatedAt: now,
  };
  memory.set(job.id, job);
  await flushNow();
  return job;
}

export async function getScrapeJob(id: string) {
  await hydrate(id);
  return memory.get(id) ?? null;
}

export async function listScrapeJobs(projectId?: string) {
  await hydrate();
  const jobs = [...memory.values()].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  if (!projectId) return jobs.slice(0, 20);
  return jobs.filter((job) => job.projectId === projectId).slice(0, 20);
}

function patchJob(id: string, patch: Partial<ScrapeJob>) {
  const current = memory.get(id);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  memory.set(id, next);
  const terminal =
    next.status === "succeeded" ||
    next.status === "failed" ||
    Boolean(next.result);
  enqueueFlush(terminal);
  return next;
}

/**
 * Resume jobs that were interrupted (hot reload / request abort) without a runner.
 */
export async function ensureScrapeJobRunning(
  id: string,
  options?: { downloadAssets?: boolean },
) {
  const job = await getScrapeJob(id);
  if (!job) return null;
  if (job.status === "succeeded" || job.status === "failed") return job;
  if (running.has(id)) return job;
  // No live runner — start (or restart stale) work.
  return runScrapeJob(id, options);
}

export async function runScrapeJob(
  id: string,
  options?: { downloadAssets?: boolean },
) {
  if (running.has(id)) {
    for (let i = 0; i < 150; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const current = await getScrapeJob(id);
      if (!current) return null;
      if (current.status === "succeeded" || current.status === "failed") {
        return current;
      }
      if (!running.has(id)) break;
    }
  }

  const existing = await getScrapeJob(id);
  if (!existing) return null;
  if (existing.status === "succeeded" || existing.status === "failed") {
    return existing;
  }

  running.add(id);
  patchJob(id, {
    status: "running",
    step: "Starting scrape",
    error: null,
  });
  await flushNow();

  let lastProgress = 0;
  try {
    const { analyseWebsite } = await import("./extract");
    let result = await analyseWebsite(existing.url, (step, meta) => {
      const now = Date.now();
      if (now - lastProgress < 350 && !/Ready|Building|homepage/i.test(step)) {
        return;
      }
      lastProgress = now;
      patchJob(id, {
        status: "running",
        step,
        pages: meta?.pages ?? 0,
        assets: meta?.assets ?? 0,
      });
    });

    if (options?.downloadAssets && existing.projectId) {
      patchJob(id, {
        status: "running",
        step: "Downloading & organising assets",
      });
      await flushNow();
      const { downloadAndOrganiseAssets } = await import("./assets");
      result = await downloadAndOrganiseAssets(existing.projectId, result);
    }

    const done = patchJob(id, {
      status: "succeeded",
      step: "Ready for review",
      pages: result.pages.length,
      assets: result.images.length,
      result,
      error: null,
    });
    await flushNow();
    running.delete(id);

    if (done?.result) {
      try {
        const { saveScrapeImport } = await import("../cms/scrape-cms");
        await saveScrapeImport({
          projectId: existing.projectId,
          jobId: id,
          sourceUrl: existing.url,
          result: done.result,
        });
      } catch (err) {
        console.error("[scrape] CMS save failed", err);
      }
    }

    return done;
  } catch (err) {
    const failed = patchJob(id, {
      status: "failed",
      step: "Failed",
      error: err instanceof Error ? err.message : "Import failed",
    });
    await flushNow();
    running.delete(id);
    return failed;
  }
}
