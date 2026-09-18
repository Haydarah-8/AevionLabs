"use client";

import { useEffect, useRef } from "react";
import {
  aabb,
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

type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  alive: boolean;
};

type State = {
  mode: Mode;
  width: number;
  height: number;
  paddleX: number;
  targetX: number;
  paddleW: number;
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  stuck: boolean;
  bricks: Brick[];
  sparks: Spark[];
  floaters: Floater[];
  score: number;
  lives: number;
  level: number;
  best: number;
  shake: number;
  keys: { left: boolean; right: boolean };
};

const BEST_KEY = "aevion-lost-smash";
const BALL = 6;
const PADDLE_H = 12;
const LABELS = [
  "DECK",
  "Q3",
  "ALIGN",
  "TBD",
  "VISION",
  "ROADMAP",
  "OFFLINE",
  "WORKSHOP",
];

function layout(width: number, level: number): Brick[] {
  const cols = Math.min(10, Math.max(6, Math.floor((width - 24) / 64)));
  const rows = Math.min(6, 2 + level);
  const gap = 5;
  const w = (width - 24 - gap * (cols - 1)) / cols;
  const h = 18;
  const bricks: Brick[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      bricks.push({
        x: 12 + c * (w + gap),
        y: 36 + r * (h + gap),
        w,
        h,
        label: LABELS[(r * cols + c + level) % LABELS.length],
        alive: true,
      });
    }
  }
  return bricks;
}

export function SmashGame({ settings, ink, paper, autoStart }: GameViewProps) {
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
      paddleX: 360,
      targetX: 360,
      paddleW: 100,
      ballX: 400,
      ballY: 200,
      ballVx: 0,
      ballVy: 0,
      stuck: true,
      bricks: [],
      sparks: [],
      floaters: [],
      score: 0,
      lives: settings.lives,
      level: settings.startLevel,
      best: loadBest(BEST_KEY),
      shake: 0,
      keys: { left: false, right: false },
    };

    const serve = (resetBricks: boolean) => {
      state.paddleW = Math.max(64, 108 - state.level * 5);
      state.paddleX = state.width / 2 - state.paddleW / 2;
      state.targetX = state.paddleX;
      state.ballX = state.paddleX + state.paddleW / 2;
      state.ballY = state.height - 40 - BALL;
      state.ballVx = 0;
      state.ballVy = 0;
      state.stuck = true;
      if (resetBricks) state.bricks = layout(state.width, state.level);
    };

    const start = () => {
      state.mode = "play";
      state.score = 0;
      state.lives = settings.lives;
      state.level = settings.startLevel;
      state.sparks = [];
      state.floaters = [];
      serve(true);
      wrap.focus();
    };

    const launch = () => {
      if (!state.stuck) return;
      const dir = Math.random() > 0.5 ? 1 : -1;
      const speed = (300 + state.level * 24) * speedMul;
      state.stuck = false;
      state.ballVx = dir * speed * 0.4;
      state.ballVy = -speed;
    };

    const resize = () => {
      const size = fitCanvas(canvas, wrap, ctx);
      state.width = size.width;
      state.height = size.height;
      if (state.mode !== "play") serve(true);
      else {
        state.paddleX = Math.min(state.paddleX, size.width - state.paddleW);
        if (state.stuck) {
          state.ballX = state.paddleX + state.paddleW / 2;
          state.ballY = size.height - 40 - BALL;
        }
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const pointer = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      state.targetX = Math.max(
        8,
        Math.min(
          state.width - state.paddleW - 8,
          clientX - rect.left - state.paddleW / 2,
        ),
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      if (state.mode === "play") pointer(event.clientX);
    };
    const onPointerDown = (event: PointerEvent) => {
      pointer(event.clientX);
      if (state.mode !== "play") start();
      else launch();
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
        else launch();
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
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const night =
        settings.night ||
        (state.mode === "play" && state.level % 3 === 0 && state.level > 2);
      const useInk = night ? paper : ink;
      const usePaper = night ? ink : paper;
      const { width, height } = state;
      const paddleY = height - 28;

      if (state.mode === "play") {
        const speed = 500 * speedMul;
        if (state.keys.left) state.targetX -= speed * dt;
        if (state.keys.right) state.targetX += speed * dt;
        state.targetX = Math.max(
          8,
          Math.min(width - state.paddleW - 8, state.targetX),
        );
        state.paddleX += (state.targetX - state.paddleX) * Math.min(1, dt * 18);
        if (state.stuck) {
          state.ballX = state.paddleX + state.paddleW / 2;
          state.ballY = paddleY - BALL - 1;
        } else {
          state.ballX += state.ballVx * dt;
          state.ballY += state.ballVy * dt;
          if (state.ballX < BALL) {
            state.ballX = BALL;
            state.ballVx *= -1;
          }
          if (state.ballX > width - BALL) {
            state.ballX = width - BALL;
            state.ballVx *= -1;
          }
          if (state.ballY < 28) {
            state.ballY = 28;
            state.ballVy *= -1;
          }
          if (
            aabb(
              state.ballX - BALL,
              state.ballY - BALL,
              BALL * 2,
              BALL * 2,
              state.paddleX,
              paddleY,
              state.paddleW,
              PADDLE_H,
            ) &&
            state.ballVy > 0
          ) {
            const t =
              (state.ballX - state.paddleX) / Math.max(1, state.paddleW);
            const angle = (t - 0.5) * 1.25;
            const mag = Math.max(
              280,
              Math.hypot(state.ballVx, state.ballVy) * 1.02,
            );
            state.ballVx = Math.sin(angle) * mag;
            state.ballVy = -Math.abs(Math.cos(angle) * mag);
            state.ballY = paddleY - BALL - 1;
          }
          for (const brick of state.bricks) {
            if (!brick.alive) continue;
            if (
              !aabb(
                state.ballX - BALL,
                state.ballY - BALL,
                BALL * 2,
                BALL * 2,
                brick.x,
                brick.y,
                brick.w,
                brick.h,
              )
            ) {
              continue;
            }
            brick.alive = false;
            const overlapX =
              BALL +
              brick.w / 2 -
              Math.abs(state.ballX - (brick.x + brick.w / 2));
            const overlapY =
              BALL +
              brick.h / 2 -
              Math.abs(state.ballY - (brick.y + brick.h / 2));
            if (overlapX < overlapY) state.ballVx *= -1;
            else state.ballVy *= -1;
            const gain = 12 + state.level * 4;
            state.score += gain;
            if (settings.particles) {
              burst(
                state.sparks,
                brick.x + brick.w / 2,
                brick.y + brick.h / 2,
                8,
              );
            }
            beep("hit", settings.sound);
            state.floaters.push({
              x: brick.x + brick.w / 2,
              y: brick.y,
              text: `+${gain}`,
              life: 0.55,
            });
            if (state.score > state.best) {
              state.best = state.score;
              saveBest(BEST_KEY, state.best);
            }
            break;
          }
          if (state.bricks.every((brick) => !brick.alive)) {
            state.level += 1;
            beep("score", settings.sound);
            serve(true);
          }
          if (state.ballY > height + 16) {
            state.lives -= 1;
            state.shake = 8;
            beep("over", settings.sound);
            if (state.lives <= 0) state.mode = "over";
            else serve(false);
          }
        }
      }

      state.shake = Math.max(0, state.shake - dt * 28);
      state.sparks = tickSparks(state.sparks, dt);
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

      for (const brick of state.bricks) {
        if (!brick.alive) continue;
        ctx.strokeStyle = useInk;
        ctx.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.w - 1, brick.h - 1);
        ctx.fillStyle = useInk;
        ctx.font = "600 8px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          brick.label,
          brick.x + brick.w / 2,
          brick.y + brick.h / 2 + 3,
        );
      }

      ctx.textAlign = "left";
      ctx.fillStyle = useInk;
      ctx.fillRect(state.paddleX, paddleY, state.paddleW, PADDLE_H);
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, BALL, 0, Math.PI * 2);
      ctx.fill();

      drawSparks(ctx, state.sparks, useInk);
      state.floaters = drawFloaters(ctx, state.floaters, dt, useInk);

      if (state.mode !== "play") {
        ctx.fillStyle = useInk;
        ctx.font = "700 16px ui-monospace, Courier New, monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          state.mode === "over" ? "G A M E  O V E R" : "",
          width / 2,
          height / 2 + 8,
        );
        ctx.font = "400 12px ui-sans-serif, system-ui, sans-serif";
        ctx.globalAlpha = 0.75;
        ctx.fillText("Break the deck. Space launches.", width / 2, height - 10);
        ctx.globalAlpha = 1;
      } else if (state.stuck) {
        ctx.fillStyle = useInk;
        ctx.globalAlpha = 0.55;
        ctx.font = "400 11px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Space or tap to launch", width / 2, height - 8);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    };
    frame = window.requestAnimationFrame(loop);
    let launchTimer = 0;
    if (autoStart) {
      start();
      launchTimer = window.setTimeout(() => launch(), 380);
    }

    return () => {
      window.clearTimeout(launchTimer);
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
      aria-label="Break the deck. Bounce the ball through the slides."
    >
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  );
}
