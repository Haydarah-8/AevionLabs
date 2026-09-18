import { getSupabaseAdmin } from "@/lib/supabase-admin";

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

export function forceFilePersistence() {
  cached = "files";
}

export async function factoryPersistence(): Promise<Persistence> {
  if (cached) return cached;
  try {
    const { error } = await getSupabaseAdmin()
      .from("website_templates")
      .select("id")
      .limit(1);
    cached = error && isMissingTable(error) ? "files" : "supabase";
  } catch (err) {
    cached = isMissingTable(err) ? "files" : "files";
  }
  return cached;
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
