export function finite(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function centroidOf(coords: unknown): [number, number] | null {
  const points: Array<[number, number]> = [];
  const walk = (node: unknown) => {
    if (!Array.isArray(node) || node.length === 0) return;
    if (typeof node[0] === "number") {
      const lon = finite(node[0]);
      const lat = finite(node[1]);
      if (lon != null && lat != null) points.push([lon, lat]);
      return;
    }
    node.forEach(walk);
  };
  walk(coords);
  if (!points.length) return null;
  const sum = points.reduce(
    (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat] as [number, number],
    [0, 0] as [number, number],
  );
  return [sum[0] / points.length, sum[1] / points.length];
}

export async function fetchJson(
  url: string,
  init: RequestInit = {},
): Promise<unknown> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept"))
    headers.set("Accept", "application/json,text/plain,*/*");
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "EWG-admin-map/1.0");
  }
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    ...init,
    headers,
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`${url} invalid JSON`);
  }
}
