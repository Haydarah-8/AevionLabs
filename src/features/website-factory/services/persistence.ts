import { promises as fs } from "fs";
import path from "path";

export type Persistence = "supabase" | "files";

let cached: Persistence | null = null;

export function isMissingTable(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const code =
    err && typeof err === "object" && "code" in err ? String(err.code) : "";
  return (
    code === "PGRST205" ||
    /schema cache/i.test(message) ||
    /Could not find the table/i.test(message) ||
    /Website Factory tables are missing/i.test(message)
  );
}

/** Clear cached backend choice (e.g. after migrations applied). */
export function resetFactoryPersistenceCache() {
  cached = null;
}

export function forceFilePersistence() {
  cached = "files";
}

export function forceSupabasePersistence() {
  cached = "supabase";
}

export async function factoryPersistence(): Promise<Persistence> {
  if (cached) return cached;
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const { error } = await getSupabaseAdmin()
      .from("website_templates")
      .select("id")
      .limit(1);
    if (error && isMissingTable(error)) {
      cached = "files";
    } else if (error) {
      // Transient/auth errors: fall back to files but do not poison forever
      console.warn("[factory] supabase probe failed, using files:", error.message);
      return "files";
    } else {
      cached = "supabase";
    }
  } catch (err) {
    if (isMissingTable(err)) {
      cached = "files";
    } else {
      console.warn(
        "[factory] supabase probe threw, using files:",
        err instanceof Error ? err.message : err,
      );
      return "files";
    }
  }
  return cached ?? "files";
}

export async function withPersistence<T>(
  filesFn: () => Promise<T>,
  supabaseFn: () => Promise<T>,
): Promise<T> {
  if ((await factoryPersistence()) === "files") return filesFn();
  try {
    return await supabaseFn();
  } catch (err) {
    if (isMissingTable(err)) {
      forceFilePersistence();
      return filesFn();
    }
    throw err;
  }
}

/** Absolute path to the local JSON fallback store. */
export function factoryJsonStorePath() {
  return path.join(process.cwd(), "data", "website-factory.json");
}

export async function factoryJsonStoreExists() {
  try {
    await fs.access(factoryJsonStorePath());
    return true;
  } catch {
    return false;
  }
}
