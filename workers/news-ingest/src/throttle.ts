const buckets = new Map<string, number[]>();

export async function throttle(domain: string, perMinute: number) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const hits = (buckets.get(domain) ?? []).filter((ts) => ts > windowStart);
  if (hits.length >= Math.max(1, perMinute)) {
    const wait = hits[0] + 60_000 - now;
    await new Promise((resolve) => setTimeout(resolve, Math.max(250, wait)));
  }
  hits.push(Date.now());
  buckets.set(domain, hits);
}

export async function withBackoff<T>(
  run: () => Promise<T>,
  retries = 2,
): Promise<T> {
  let last: unknown;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await run();
    } catch (err) {
      last = err;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(8000, 400 * 2 ** i)),
      );
    }
  }
  throw last instanceof Error ? last : new Error("retry failed");
}

export function circuitOpen(
  failureCount: number,
  lastFailureAt?: string | null,
) {
  if (failureCount < 5 || !lastFailureAt) return false;
  return Date.now() - Date.parse(lastFailureAt) < 15 * 60 * 1000;
}
