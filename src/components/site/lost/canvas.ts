export type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export type Floater = {
  x: number;
  y: number;
  text: string;
  life: number;
};

export function loadBest(key: string) {
  try {
    const value = Number(localStorage.getItem(key) || 0);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function saveBest(key: string, score: number) {
  try {
    localStorage.setItem(key, String(score));
  } catch {
    /* ignore */
  }
}

export function burst(sparks: Spark[], x: number, y: number, n: number) {
  for (let i = 0; i < n; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const s = 50 + Math.random() * 220;
    sparks.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 0.22 + Math.random() * 0.4,
    });
  }
}

export function tickSparks(sparks: Spark[], dt: number) {
  for (const spark of sparks) {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 460 * dt;
    spark.life -= dt;
  }
  return sparks.filter((spark) => spark.life > 0);
}

export function fitCanvas(
  canvas: HTMLCanvasElement,
  wrap: HTMLElement,
  ctx: CanvasRenderingContext2D,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(280, wrap.clientWidth);
  const height = Math.max(120, wrap.clientHeight);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height };
}

export function aabb(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function drawSparks(
  ctx: CanvasRenderingContext2D,
  sparks: Spark[],
  color = "#535353",
) {
  for (const spark of sparks) {
    ctx.globalAlpha = Math.max(0, spark.life * 3);
    ctx.fillStyle = color;
    ctx.fillRect(spark.x, spark.y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

export function drawFloaters(
  ctx: CanvasRenderingContext2D,
  floaters: Floater[],
  dt: number,
  color = "#535353",
) {
  const next: Floater[] = [];
  ctx.textAlign = "center";
  ctx.font = "500 12px ui-sans-serif, system-ui, sans-serif";
  for (const item of floaters) {
    item.y -= 38 * dt;
    item.life -= dt;
    if (item.life <= 0) continue;
    ctx.globalAlpha = Math.min(1, item.life * 2);
    ctx.fillStyle = color;
    ctx.fillText(item.text, item.x, item.y);
    next.push(item);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  return next;
}

export function frameStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  paper = "#fff",
  ink = "#535353",
) {
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.18;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  ctx.globalAlpha = 1;
}

let audio: AudioContext | null = null;

export function beep(kind: "jump" | "hit" | "score" | "over", on: boolean) {
  if (!on) return;
  try {
    audio ??= new AudioContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;
    osc.type = kind === "over" ? "sawtooth" : "square";
    osc.frequency.value =
      kind === "jump" ? 520 : kind === "hit" ? 180 : kind === "score" ? 740 : 110;
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  } catch {
    /* ignore */
  }
}
