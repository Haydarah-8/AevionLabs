const FETCH_MS = 25_000;

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<{ data: T; status: number; ms: number }> {
  const started = Date.now();
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(FETCH_MS),
    cache: "no-store",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-GB,en;q=0.9",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      ...init.headers,
    },
  });
  const ms = Date.now() - started;
  if (res.status === 429) {
    const err = new Error("rate_limited") as Error & { status: number };
    err.status = 429;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`${res.status} ${url}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return { data: (await res.json()) as T, status: res.status, ms };
}

export async function withBackoff<T>(
  run: () => Promise<T>,
  attempts = 3,
): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await run();
    } catch (err) {
      last = err;
      const status = (err as { status?: number }).status;
      if (status === 429 || i === attempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** i));
    }
  }
  throw last;
}
