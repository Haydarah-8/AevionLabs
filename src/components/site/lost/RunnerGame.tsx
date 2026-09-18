"use client";

import { useEffect, useRef } from "react";
import { beep, fitCanvas, loadBest, saveBest } from "./canvas";
import { SPEED_MULT, type GameViewProps } from "./settings";

type Mode = "ready" | "play" | "over";
type Kind = "cactus" | "cacti" | "tall" | "bird";

type Obstacle = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: Kind;
  wing: number;
};

type Cloud = { x: number; y: number; w: number };

type State = {
  mode: Mode;
  width: number;
  height: number;
  dinoY: number;
  dinoVy: number;
  duck: boolean;
  onGround: boolean;
  frame: number;
  frameIn: number;
  obstacles: Obstacle[];
  clouds: Cloud[];
  spawnIn: number;
  ground: number;
  score: number;
  best: number;
  level: number;
  flash: number;
  nightNow: boolean;
  keys: { jump: boolean; duck: boolean };
};

const BEST_KEY = "aevion-lost-run";
const DINO_X = 52;
const RUN_W = 44;
const RUN_H = 46;
const DUCK_W = 58;
const DUCK_H = 26;

function dinoBox(state: State) {
  if (state.duck && state.onGround) {
    return { x: DINO_X, y: state.dinoY + 20, w: DUCK_W - 8, h: DUCK_H - 4 };
  }
  return { x: DINO_X + 8, y: state.dinoY + 4, w: RUN_W - 16, h: RUN_H - 8 };
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  ink: string,
) {
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + 8, y - 10, x + w * 0.35, y - 12, x + w * 0.45, y - 4);
  ctx.bezierCurveTo(x + w * 0.7, y - 14, x + w, y - 2, x + w, y + 4);
  ctx.lineTo(x, y + 4);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawCactus(ctx: CanvasRenderingContext2D, o: Obstacle, ink: string) {
  ctx.fillStyle = ink;
  if (o.kind === "cacti") {
    ctx.fillRect(o.x, o.y, 8, o.h);
    ctx.fillRect(o.x - 6, o.y + 10, 6, 4);
    ctx.fillRect(o.x - 6, o.y + 10, 4, 16);
    ctx.fillRect(o.x + 8, o.y + 16, 6, 4);
    ctx.fillRect(o.x + 10, o.y + 8, 4, 12);
    ctx.fillRect(o.x + 18, o.y + 8, 10, o.h - 8);
    ctx.fillRect(o.x + 28, o.y + 14, 5, 4);
    ctx.fillRect(o.x + 28, o.y + 6, 4, 12);
  } else if (o.kind === "tall") {
    ctx.fillRect(o.x, o.y, 12, o.h);
    ctx.fillRect(o.x - 8, o.y + 14, 8, 5);
    ctx.fillRect(o.x - 8, o.y + 14, 5, 18);
    ctx.fillRect(o.x + 12, o.y + 22, 8, 5);
    ctx.fillRect(o.x + 15, o.y + 10, 5, 17);
  } else {
    ctx.fillRect(o.x, o.y, 10, o.h);
    ctx.fillRect(o.x - 6, o.y + 8, 6, 4);
    ctx.fillRect(o.x - 6, o.y + 8, 4, 12);
    ctx.fillRect(o.x + 10, o.y + 12, 6, 4);
    ctx.fillRect(o.x + 12, o.y + 6, 4, 10);
  }
}

function drawBird(ctx: CanvasRenderingContext2D, o: Obstacle, ink: string) {
  ctx.fillStyle = ink;
  const up = o.wing % 2 === 0;
  ctx.fillRect(o.x + 10, o.y + 8, 22, 8);
  ctx.fillRect(o.x + 28, o.y + 6, 10, 6);
  ctx.fillRect(o.x + 36, o.y + 8, 6, 3);
  if (up) {
    ctx.fillRect(o.x + 14, o.y, 6, 10);
    ctx.fillRect(o.x + 12, o.y, 14, 4);
  } else {
    ctx.fillRect(o.x + 14, o.y + 12, 6, 10);
    ctx.fillRect(o.x + 12, o.y + 18, 14, 4);
  }
}

function drawDino(
  ctx: CanvasRenderingContext2D,
  state: State,
  ink: string,
  paper: string,
) {
  const x = DINO_X;
  const y = state.dinoY;
  ctx.fillStyle = ink;
  if (state.duck && state.onGround) {
    ctx.fillRect(x, y + 20, 48, 18);
    ctx.fillRect(x + 42, y + 14, 20, 16);
    ctx.fillRect(x + 58, y + 18, 6, 5);
    ctx.fillStyle = paper;
    ctx.fillRect(x + 52, y + 18, 3, 3);
    ctx.fillStyle = ink;
    const step = state.frame % 2;
    ctx.fillRect(x + 10, y + 36, 10, step ? 8 : 6);
    ctx.fillRect(x + 28, y + 36, 10, step ? 6 : 8);
    return;
  }
  ctx.fillRect(x + 16, y + 10, 22, 26);
  ctx.fillRect(x + 28, y, 24, 18);
  ctx.fillRect(x + 48, y + 8, 8, 6);
  ctx.fillRect(x, y + 16, 20, 8);
  ctx.fillRect(x + 18, y + 22, 7, 8);
  ctx.fillStyle = paper;
  ctx.fillRect(x + 40, y + 4, 4, 4);
  ctx.fillStyle = ink;
  const step = state.frame % 2;
  if (!state.onGround) {
    ctx.fillRect(x + 20, y + 34, 8, 14);
    ctx.fillRect(x + 32, y + 34, 8, 10);
  } else if (step === 0) {
    ctx.fillRect(x + 20, y + 34, 8, 16);
    ctx.fillRect(x + 32, y + 34, 8, 10);
  } else {
    ctx.fillRect(x + 20, y + 34, 8, 10);
    ctx.fillRect(x + 32, y + 34, 8, 16);
  }
}

function spawnObstacle(state: State, level: number) {
  const groundY = state.height - 22;
  const roll = Math.random();
  let kind: Kind = "cactus";
  if (level >= 3 && roll > 0.62) kind = "bird";
  else if (level >= 2 && roll > 0.38) kind = "cacti";
  else if (roll > 0.55) kind = "tall";

  if (kind === "bird") {
    const lanes = [groundY - 62, groundY - 42, groundY - 86];
    const y = lanes[Math.floor(Math.random() * (level >= 5 ? 3 : 2))];
    state.obstacles.push({
      x: state.width + 20,
      y,
      w: 42,
      h: 24,
      kind,
      wing: 0,
    });
    return;
  }
  const h = kind === "tall" ? 52 : kind === "cacti" ? 40 : 34;
  const w = kind === "cacti" ? 36 : kind === "tall" ? 20 : 16;
  state.obstacles.push({
    x: state.width + 20,
    y: groundY - h,
    w,
    h,
    kind,
    wing: 0,
  });
}

export function RunnerGame({ settings, ink, paper, autoStart }: GameViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state: State = {
      mode: "ready",
      width: 600,
      height: 150,
      dinoY: 80,
      dinoVy: 0,
      duck: false,
      onGround: true,
      frame: 0,
      frameIn: 0,
      obstacles: [],
      clouds: [
        { x: 120, y: 28, w: 46 },
        { x: 320, y: 18, w: 58 },
        { x: 510, y: 34, w: 40 },
      ],
      spawnIn: 1,
      ground: 0,
      score: 0,
      best: loadBest(BEST_KEY),
      level: settings.startLevel,
      flash: 0,
      nightNow: settings.night,
      keys: { jump: false, duck: false },
    };

    const groundY = () => state.height - 22;
    const standY = () => groundY() - RUN_H;

    const resize = () => {
      const size = fitCanvas(canvas, wrap, ctx);
      state.width = size.width;
      state.height = size.height;
      if (state.onGround) state.dinoY = standY();
    };
    resize();
    state.dinoY = standY();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const jump = () => {
      if (state.mode !== "play") return;
      if (!state.onGround) return;
      if (state.duck) return;
      state.dinoVy = -620;
      state.onGround = false;
      beep("jump", settings.sound);
    };

    const start = () => {
      state.mode = "play";
      state.obstacles = [];
      state.score = 0;
      state.level = settings.startLevel;
      state.spawnIn = 1.1;
      state.dinoY = standY();
      state.dinoVy = 0;
      state.onGround = true;
      state.duck = false;
      state.flash = 0;
      state.nightNow = settings.night;
      wrap.focus();
      jump();
    };

    const onPointerDown = () => {
      if (state.mode !== "play") start();
      else jump();
    };

    const onKey = (event: KeyboardEvent) => {
      const down = event.type === "keydown";
      if (event.key === " " || event.key === "ArrowUp" || event.key === "w") {
        event.preventDefault();
        state.keys.jump = down;
        if (down) {
          if (state.mode !== "play") start();
          else jump();
        }
      }
      if (event.key === "ArrowDown" || event.key === "s") {
        event.preventDefault();
        state.keys.duck = down;
        state.duck = down;
        if (down && !state.onGround) state.dinoVy = Math.max(state.dinoVy, 280);
      }
    };

    wrap.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey, { passive: false });
    window.addEventListener("keyup", onKey);

    let last = performance.now();
    let frame = 0;
    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (document.hidden) return;

      const { width, height } = state;
      const gy = groundY();
      const speed = (340 + state.level * 42) * SPEED_MULT[settings.speed];
      const nightCycle = Math.floor(state.score / 700) % 2 === 1;
      state.nightNow = settings.night || (state.mode === "play" && nightCycle);
      const useInk = state.nightNow ? paper : ink;
      const usePaper = state.nightNow ? ink : paper;

      if (state.mode === "play") {
        state.score += dt * speed * 0.12;
        const nextLevel = settings.startLevel + Math.floor(state.score / 500);
        if (nextLevel !== state.level) {
          state.level = nextLevel;
          beep("score", settings.sound);
        }
        if (state.score > state.best) {
          state.best = Math.floor(state.score);
          saveBest(BEST_KEY, state.best);
        }

        state.dinoVy += (state.duck && !state.onGround ? 2600 : 1850) * dt;
        state.dinoY += state.dinoVy * dt;
        if (state.dinoY >= standY()) {
          state.dinoY = standY();
          state.dinoVy = 0;
          state.onGround = true;
        }

        state.frameIn += dt;
        if (state.frameIn > 0.1) {
          state.frame += 1;
          state.frameIn = 0;
        }

        state.ground += speed * dt;
        for (const cloud of state.clouds) {
          cloud.x -= speed * dt * 0.28;
          if (cloud.x < -80) {
            cloud.x = width + 40 + Math.random() * 120;
            cloud.y = 12 + Math.random() * 28;
          }
        }

        state.spawnIn -= dt;
        if (state.spawnIn <= 0) {
          spawnObstacle(state, state.level);
          const gap =
            Math.max(0.55, 1.35 - state.level * 0.08) /
            SPEED_MULT[settings.speed];
          state.spawnIn = gap + Math.random() * 0.45;
        }

        const hit = dinoBox(state);
        const next: Obstacle[] = [];
        for (const item of state.obstacles) {
          item.x -= speed * dt;
          item.wing += dt * 8;
          if (item.x + item.w < -20) continue;
          const pad = 4;
          if (
            hit.x < item.x + item.w - pad &&
            hit.x + hit.w > item.x + pad &&
            hit.y < item.y + item.h - pad &&
            hit.y + hit.h > item.y + pad
          ) {
            state.mode = "over";
            state.flash = 0.2;
            beep("over", settings.sound);
          }
          next.push(item);
        }
        state.obstacles = next;
      } else {
        state.frameIn += dt;
        if (state.frameIn > 0.18) {
          state.frame += 1;
          state.frameIn = 0;
        }
      }

      state.flash = Math.max(0, state.flash - dt);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = usePaper;
      ctx.fillRect(0, 0, width, height);

      for (const cloud of state.clouds) {
        drawCloud(ctx, cloud.x, cloud.y, cloud.w, useInk);
      }

      ctx.strokeStyle = useInk;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
      ctx.fillStyle = useInk;
      for (let i = 0; i < 18; i += 1) {
        const gx = ((i * 48 - state.ground) % (width + 48)) + 8;
        ctx.fillRect(gx, gy + 4, 3, 2);
        ctx.fillRect(gx + 18, gy + 7, 2, 2);
      }

      for (const item of state.obstacles) {
        if (item.kind === "bird") drawBird(ctx, item, useInk);
        else drawCactus(ctx, item, useInk);
      }

      drawDino(ctx, state, useInk, usePaper);

      ctx.fillStyle = useInk;
      ctx.font = "700 13px ui-monospace, Courier New, monospace";
      ctx.textAlign = "right";
      const score = String(Math.floor(state.score)).padStart(5, "0");
      const best = String(Math.floor(state.best)).padStart(5, "0");
      ctx.fillText(`HI ${best}  ${score}`, width - 12, 22);
      ctx.textAlign = "left";
      ctx.font = "600 11px ui-monospace, Courier New, monospace";
      ctx.fillText(`LV ${Math.max(1, state.level)}`, 12, 22);

      if (state.mode !== "play") {
        ctx.fillStyle = useInk;
        ctx.font = "700 16px ui-monospace, Courier New, monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          state.mode === "over" ? "G A M E  O V E R" : "",
          width / 2,
          height / 2 - 8,
        );
        if (state.mode === "over") {
          ctx.strokeStyle = useInk;
          ctx.strokeRect(width / 2 - 12, height / 2 + 6, 24, 24);
          ctx.beginPath();
          ctx.arc(width / 2, height / 2 + 18, 7, 0.4, Math.PI * 1.7);
          ctx.stroke();
        }
        ctx.font = "400 12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = useInk;
        ctx.globalAlpha = 0.75;
        ctx.fillText(
          state.mode === "over"
            ? "Press space or tap to retry"
            : "Press space or tap to play",
          width / 2,
          height - 10,
        );
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
      }

      if (state.flash > 0) {
        ctx.fillStyle = useInk;
        ctx.globalAlpha = state.flash * 0.35;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
      }
    };
    frame = window.requestAnimationFrame(loop);
    if (autoStart) start();

    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [autoStart, ink, paper, settings]);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      className="dino-canvas-wrap"
      aria-label="Chrome-style runner. Space or tap to jump. Down to duck."
    >
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  );
}
