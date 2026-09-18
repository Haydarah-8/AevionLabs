export async function withBackoff<T>(
  run: () => Promise<T>,
  retries = 2,
): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await run();
    } catch (err) {
      last = err;
      if (attempt === retries) break;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(8000, 50 * 2 ** attempt)),
      );
    }
  }
  throw last instanceof Error ? last : new Error("retry failed");
}

export function circuitOpen(
  failureCount: number,
  lastFailureAt?: string | null,
  windowMs = 15 * 60 * 1000,
) {
  if (failureCount < 5 || !lastFailureAt) return false;
  return Date.now() - Date.parse(lastFailureAt) < windowMs;
}
