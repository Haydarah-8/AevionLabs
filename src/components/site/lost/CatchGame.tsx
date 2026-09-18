"use client";

import { useEffect, useRef } from "react";
import {
  beep,
  burst,
  drawFloaters,
  drawSparks,
  fitCanvas,
  frameStage,
  loadBest,
  saveBest,
  tickSparks,
  type Floater,
  type Spark,
} from "./canvas";
import { SPEED_MULT, type GameViewProps } from "./settings";

type Mode = "ready" | "play" | "over";
type Kind = "proto" | "click" | "ship" | "deck" | "align" | "maybe";

type Item = {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  kind: Kind;
  spin: number;
  label: string;
};

type State = {
  mode: Mode;
  width: number;
  height: number;
  playerX: number;
  targetX: number;
  items: Item[];
  sparks: Spark[];
  floaters: Floater[];
  spawnIn: number;
  score: number;
  combo: number;
  lives: number;
  level: number;
  best: number;
  flash: number;
  shake: number;
  slow: number;
  trail: { x: number; life: number }[];
  keys: { left: boolean; right: boolean };
};

const BEST_KEY = "aevion-lost-catch";
const PLAYER_W = 86;
const PLAYER_H = 16;

function hit(a: Item, px: number, py: number, pw: number, ph: number) {
  return a.x < px + pw && a.x + a.w > px && a.y < py + ph && a.y + a.h > py;
}

function spawn(state: State, heat: number, speedMul: number) {
  const roll = Math.random();
  let kind: Kind;
  if (roll < heat * 0.52) kind = "deck";
  else if (roll < heat * 0.7) kind = "align";
  else if (roll < heat * 0.84) kind = "maybe";
  else if (roll < heat * 0.84 + 0.08) kind = "click";
  else if (roll < heat * 0.84 + 0.12) kind = "ship";
  else kind = "proto";

  const size =
    kind === "align"
      ? { w: 78, h: 36 }
      : kind === "click"
        ? { w: 42, h: 36 }
        : kind === "ship"
          ? { w: 54, h: 28 }
          : kind === "maybe"
            ? { w: 62, h: 32 }
            : kind === "deck"
              ? { w: 68, h: 34 }
              : { w: 48, h: 40 };

  const labels: Record<Kind, string> = {
    proto: "USE",
    click: "CLICK",
    ship: "SHIP",
    deck: "DECK",
    align: "ALIGN",
    maybe: "MAYBE",
  };

  state.items.push({
    x: 16 + Math.random() * (state.width - size.w - 32),
    y: -40,
    w: size.w,
    h: size.h,
    vy:
      ((kind === "click" ? 210 : kind === "align" ? 118 : 150) +
        Math.random() * 80 +
        state.level * 18) *
      speedMul,
    kind,
    spin: (Math.random() - 0.5) * 1.2,
    label: labels[kind],
  });
}

export function CatchGame({ settings, ink, paper, autoStart }: GameViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const speedMul = SPEED_MULT[settings.speed];

    const state: State = {
      mode: "ready",
      width: 800,
      height: 280,
      playerX: 400,
      targetX: 400,
      items: [],
      sparks: [],
      floaters: [],
      spawnIn: 0.5,
      score: 0,
      combo: 0,
      lives: settings.lives,
      level: settings.startLevel,
      best: loadBest(BEST_KEY),
      flash: 0,
      shake: 0,
      slow: 0,
      trail: [],
      keys: { left: false, right: false },
    };

    const resize = () => {
      const size = fitCanvas(canvas, wrap, ctx);
      state.width = size.width;
      state.height = size.height;
      state.playerX = Math.min(state.playerX, size.width - PLAYER_W);
      state.targetX = Math.min(state.targetX, size.width - PLAYER_W);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const start = () => {
      state.mode = "play";
      state.items = [];
      state.sparks = [];
      state.floaters = [];
      state.trail = [];
      state.score = 0;
      state.combo = 0;
      state.lives = settings.lives;
      state.level = settings.startLevel;
      state.spawnIn = 0.4;
      state.flash = 0;
      state.shake = 0;
      state.slow = 0;
      state.playerX = state.width / 2 - PLAYER_W / 2;
      state.targetX = state.playerX;
      wrap.focus();
    };

    const pointer = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      state.targetX = Math.max(
        8,
        Math.min(
          state.width - PLAYER_W - 8,
          clientX - rect.left - PLAYER_W / 2,
        ),
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      if (state.mode === "play") pointer(event.clientX);
    };
    const onPointerDown = (event: PointerEvent) => {
      pointer(event.clientX);
      if (state.mode !== "play") start();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        state.keys.left = event.type === "keydown";
        if (state.mode === "play") event.preventDefault();
      }
      if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      ) {
        state.keys.right = event.type === "keydown";
        if (state.mode === "play") event.preventDefault();
      }
      if (
        event.type === "keydown" &&
        (event.key === " " || event.key === "Enter")
      ) {
        event.preventDefault();
        if (state.mode !== "play") start();
      }
    };

    wrap.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("keydown", onKey, { passive: false });
    window.addEventListener("keyup", onKey);

    let last = performance.now();
    let frame = 0;
    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const raw = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const dt = state.slow > 0 ? raw * 0.42 : raw;
      state.slow = Math.max(0, state.slow - raw);
      const night =
        settings.night ||
        (state.mode === "play" && state.level % 4 === 0 && state.level > 1);
      const useInk = night ? paper : ink;
      const usePaper = night ? ink : paper;

      const { width, height } = state;
      const py = height - 36;

      if (state.mode === "play") {
        const speed = 420 * speedMul;
        if (state.keys.left) state.targetX -= speed * raw;
        if (state.keys.right) state.targetX += speed * raw;
        state.targetX = Math.max(
          8,
          Math.min(width - PLAYER_W - 8, state.targetX),
        );
        state.playerX +=
          (state.targetX - state.playerX) * Math.min(1, raw * 16);
        if (settings.particles) {
          state.trail.push({ x: state.playerX, life: 0.18 });
          state.trail = state.trail
            .map((item) => ({ ...item, life: item.life - raw }))
            .filter((item) => item.life > 0);
        }

        const nextLevel = settings.startLevel + Math.floor(state.score / 420);
        if (nextLevel !== state.level) {
          state.level = nextLevel;
          beep("score", settings.sound);
        }

        state.spawnIn -= dt;
        if (state.spawnIn <= 0) {
          const heat = Math.min(0.82, 0.22 + state.level * 0.07);
          spawn(state, heat, speedMul);
          state.spawnIn = Math.max(
            0.16,
            (0.88 - state.level * 0.05) / speedMul,
          );
        }

        const next: Item[] = [];
        for (const item of state.items) {
          item.y += item.vy * dt;
          item.spin += dt * 0.8;
          if (hit(item, state.playerX, py, PLAYER_W, PLAYER_H)) {
            const cx = item.x + item.w / 2;
            const cy = item.y + item.h / 2;
            const good =
              item.kind === "proto" ||
              item.kind === "click" ||
              item.kind === "ship";
            if (good) {
              state.combo += 1;
              const gain =
                item.kind === "click"
                  ? 28 + state.combo * 3
                  : item.kind === "ship"
                    ? 16
                    : 10 + Math.min(36, state.combo * 4);
              state.score += gain;
              if (item.kind === "ship") {
                state.slow = 1.6;
                if (state.lives < settings.lives) state.lives += 1;
              }
              if (settings.particles) burst(state.sparks, cx, cy, 12);
              beep("hit", settings.sound);
              state.floaters.push({
                x: cx,
                y: cy,
                text: `+${gain}`,
                life: 0.6,
              });
              if (state.score > state.best) {
                state.best = state.score;
                saveBest(BEST_KEY, state.best);
              }
            } else {
              state.combo = 0;
              state.lives -= 1;
              state.flash = 0.22;
              state.shake = 8;
              if (settings.particles) burst(state.sparks, cx, cy, 8);
              beep("over", settings.sound);
              if (state.lives <= 0) state.mode = "over";
            }
            continue;
          }
          if (item.y < height + 50) next.push(item);
          else if (goodKind(item.kind)) state.combo = 0;
        }
        state.items = next;
      }

      state.flash = Math.max(0, state.flash - raw);
      state.shake = Math.max(0, state.shake - raw * 28);
      state.sparks = tickSparks(state.sparks, raw);

      const ox = (Math.random() - 0.5) * state.shake;
      const oy = (Math.random() - 0.5) * state.shake;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(ox, oy);
      frameStage(ctx, width, height, usePaper, useInk);

      ctx.fillStyle = useInk;
      ctx.font = "700 11px ui-monospace, Courier New, monospace";
      ctx.fillText(
        `LV ${state.level}   ${state.score}   HI ${state.best}   LIVES ${Math.max(0, state.lives)}`,
        12,
        20,
      );
      if (state.combo > 1) ctx.fillText(`x${state.combo}`, width - 48, 20);

      for (const item of state.items) {
        ctx.save();
        ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
        ctx.rotate(item.spin * 0.12);
        const filled =
          item.kind === "proto" ||
          item.kind === "click" ||
          item.kind === "ship";
        if (filled) {
          ctx.fillStyle = useInk;
          ctx.fillRect(-item.w / 2, -item.h / 2, item.w, item.h);
          ctx.fillStyle = usePaper;
        } else {
          ctx.strokeStyle = useInk;
          ctx.strokeRect(-item.w / 2, -item.h / 2, item.w, item.h);
          ctx.fillStyle = useInk;
        }
        ctx.font = "700 10px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(item.label, 0, 4);
        ctx.restore();
      }

      ctx.textAlign = "left";
      drawSparks(ctx, state.sparks, useInk);
      state.floaters = drawFloaters(ctx, state.floaters, raw, useInk);

      ctx.fillStyle = useInk;
      ctx.fillRect(state.playerX, py, PLAYER_W, PLAYER_H);

      if (state.mode !== "play") {
        ctx.fillStyle = useInk;
        ctx.font = "700 16px ui-monospace, Courier New, monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          state.mode === "over" ? "G A M E  O V E R" : "",
          width / 2,
          height / 2,
        );
        ctx.font = "400 12px ui-sans-serif, system-ui, sans-serif";
        ctx.globalAlpha = 0.75;
        ctx.fillText(
          "Catch USE. Dodge DECK. Space or tap.",
          width / 2,
          height - 12,
        );
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    };
    frame = window.requestAnimationFrame(loop);
    if (autoStart) start();

    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [autoStart, ink, paper, settings]);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      className="dino-canvas-wrap"
      aria-label="Catch USE tiles and dodge DECK tiles."
    >
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  );
}

function goodKind(kind: Kind) {
  return kind === "proto" || kind === "click" || kind === "ship";
}
