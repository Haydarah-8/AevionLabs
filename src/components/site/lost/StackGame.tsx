"use client";

import { useEffect, useRef } from "react";
import { beep, fitCanvas, loadBest, saveBest } from "./canvas";
import { SPEED_MULT, type GameViewProps } from "./settings";

type Mode = "ready" | "play" | "over";
type Block = { x: number; y: number; w: number };

type State = {
  mode: Mode;
  width: number;
  height: number;
  stack: Block[];
  mover: Block;
  dir: number;
  score: number;
  best: number;
  level: number;
  perfect: number;
};

const BEST_KEY = "aevion-lost-stack";
const BLOCK_H = 28;

export function StackGame({ settings, ink, paper, autoStart }: GameViewProps) {
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
      height: 500,
      stack: [],
      mover: { x: 0, y: 0, w: 180 },
      dir: 1,
      score: 0,
      best: loadBest(BEST_KEY),
      level: settings.startLevel,
      perfect: 0,
    };

    const resize = () => {
      const size = fitCanvas(canvas, wrap, ctx);
      state.width = size.width;
      state.height = size.height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const topY = () =>
      state.height - 48 - state.stack.length * BLOCK_H;

    const placeMover = () => {
      const prev = state.stack[state.stack.length - 1];
      state.mover = {
        x: 16,
        y: topY() - BLOCK_H,
        w: prev ? prev.w : Math.min(220, state.width * 0.42),
      };
      state.dir = Math.random() > 0.5 ? 1 : -1;
    };

    const start = () => {
      const w = Math.min(220, state.width * 0.42);
      state.mode = "play";
      state.score = 0;
      state.perfect = 0;
      state.level = settings.startLevel;
      state.stack = [
        { x: state.width / 2 - w / 2, y: state.height - 48 - BLOCK_H, w },
      ];
      placeMover();
      wrap.focus();
    };

    const drop = () => {
      if (state.mode !== "play") {
        start();
        return;
      }
      const prev = state.stack[state.stack.length - 1];
      const left = Math.max(state.mover.x, prev.x);
      const right = Math.min(state.mover.x + state.mover.w, prev.x + prev.w);
      const w = right - left;
      if (w < 10) {
        state.mode = "over";
        beep("over", settings.sound);
        return;
      }
      const perfect = Math.abs(state.mover.x - prev.x) < 4;
      if (perfect) {
        state.perfect += 1;
        beep("score", settings.sound);
      } else beep("hit", settings.sound);
      state.stack.push({ x: left, y: prev.y - BLOCK_H, w });
      state.score += 10 + state.perfect * 4 + Math.round(w / 8);
      state.level = settings.startLevel + Math.floor(state.stack.length / 4);
      if (state.score > state.best) {
        state.best = state.score;
        saveBest(BEST_KEY, state.best);
      }
      placeMover();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        drop();
      }
    };
    wrap.addEventListener("pointerdown", drop);
    window.addEventListener("keydown", onKey, { passive: false });

    let last = performance.now();
    let frame = 0;
    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const { width, height } = state;
      const night = settings.night;
      const useInk = night ? paper : ink;
      const usePaper = night ? ink : paper;

      if (state.mode === "play") {
        const speed = (140 + state.level * 28) * speedMul;
        state.mover.x += state.dir * speed * dt;
        if (state.mover.x <= 12) {
          state.mover.x = 12;
          state.dir = 1;
        }
        if (state.mover.x + state.mover.w >= width - 12) {
          state.mover.x = width - 12 - state.mover.w;
          state.dir = -1;
        }
      }

      const camera = Math.max(0, state.stack.length * BLOCK_H - height * 0.55);

      ctx.fillStyle = usePaper;
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.translate(0, camera);

      ctx.fillStyle = useInk;
      for (let i = 0; i < state.stack.length; i += 1) {
        const block = state.stack[i];
        ctx.fillRect(block.x, block.y, block.w, BLOCK_H - 3);
      }
      if (state.mode === "play") {
        ctx.globalAlpha = 0.88;
        ctx.fillRect(state.mover.x, state.mover.y, state.mover.w, BLOCK_H - 3);
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      ctx.fillStyle = useInk;
      ctx.font = "500 13px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(
        `LV ${state.level}    ${state.score}    HI ${state.best}${
          state.perfect > 1 ? `    PERFECT x${state.perfect}` : ""
        }`,
        16,
        24,
      );

      if (state.mode !== "play") {
        ctx.textAlign = "center";
        ctx.font = "400 28px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(
          state.mode === "over" ? "You dropped the build." : "",
          width / 2,
          height / 2,
        );
        ctx.font = "400 14px ui-sans-serif, system-ui, sans-serif";
        ctx.globalAlpha = 0.6;
        ctx.fillText("Tap or space to stack the prototype.", width / 2, height - 24);
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
      }
    };
    frame = window.requestAnimationFrame(loop);
    if (autoStart) start();

    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", drop);
      window.removeEventListener("keydown", onKey);
    };
  }, [autoStart, ink, paper, settings]);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      className="lost-canvas-wrap"
      aria-label="Stack the prototype. Tap or space to drop."
    >
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  );
}
