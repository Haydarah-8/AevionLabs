const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = buckets.get(input.key);
  if (!current || current.resetAt < now) {
    buckets.set(input.key, { count: 1, resetAt: now + input.windowMs });
    return { ok: true, remaining: input.limit - 1, resetAt: now + input.windowMs };
  }
  if (current.count >= input.limit) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }
  current.count += 1;
  return { ok: true, remaining: input.limit - current.count, resetAt: current.resetAt };
}
