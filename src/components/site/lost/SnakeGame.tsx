"use client";

import { useEffect, useRef } from "react";
import { beep, fitCanvas, loadBest, saveBest } from "./canvas";
import { SPEED_MULT, type GameViewProps } from "./settings";

type Mode = "ready" | "play" | "over";
type Cell = { x: number; y: number };

type State = {
  mode: Mode;
  width: number;
  height: number;
  cell: number;
  cols: number;
  rows: number;
  snake: Cell[];
  dir: Cell;
  nextDir: Cell;
  food: Cell;
  poison: Cell[];
  tickIn: number;
  score: number;
  best: number;
  level: number;
  grow: number;
};

const BEST_KEY = "aevion-lost-snake";

function same(a: Cell, b: Cell) {
  return a.x === b.x && a.y === b.y;
}

function spawnFree(state: State, extra: Cell[] = []): Cell {
  for (let i = 0; i < 80; i += 1) {
    const cell = {
      x: 1 + Math.floor(Math.random() * (state.cols - 2)),
      y: 1 + Math.floor(Math.random() * (state.rows - 2)),
    };
    if (state.snake.some((part) => same(part, cell))) continue;
    if (extra.some((part) => same(part, cell))) continue;
    if (state.poison.some((part) => same(part, cell))) continue;
    return cell;
  }
  return { x: 2, y: 2 };
}

export function SnakeGame({ settings, ink, paper, autoStart }: GameViewProps) {
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
      cell: 22,
      cols: 20,
      rows: 16,
      snake: [{ x: 6, y: 8 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: { x: 12, y: 8 },
      poison: [],
      tickIn: 0.16,
      score: 0,
      best: loadBest(BEST_KEY),
      level: settings.startLevel,
      grow: 0,
    };

    const fit = () => {
      const size = fitCanvas(canvas, wrap, ctx);
      state.width = size.width;
      state.height = size.height;
      state.cell = Math.max(
        16,
        Math.floor(Math.min(size.width / 28, size.height / 20)),
      );
      state.cols = Math.floor(size.width / state.cell);
      state.rows = Math.floor(size.height / state.cell);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    const start = () => {
      fit();
      const mid = {
        x: Math.floor(state.cols / 3),
        y: Math.floor(state.rows / 2),
      };
      state.mode = "play";
      state.snake = [
        mid,
        { x: mid.x - 1, y: mid.y },
        { x: mid.x - 2, y: mid.y },
      ];
      state.dir = { x: 1, y: 0 };
      state.nextDir = { x: 1, y: 0 };
      state.poison = [];
      state.score = 0;
      state.level = settings.startLevel;
      state.grow = 0;
      state.food = spawnFree(state);
      wrap.focus();
    };

    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, Cell> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };
      const dir = map[event.key] || map[event.key.toLowerCase()];
      if (dir) {
        event.preventDefault();
        if (state.dir.x + dir.x !== 0 || state.dir.y + dir.y !== 0) {
          state.nextDir = dir;
        }
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (state.mode !== "play") start();
      }
    };

    const onPointer = () => {
      if (state.mode !== "play") start();
    };

    wrap.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey, { passive: false });

    let last = performance.now();
    let frame = 0;
    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const { width, height, cell } = state;
      const night = settings.night;
      const useInk = night ? paper : ink;
      const usePaper = night ? ink : paper;

      if (state.mode === "play") {
        const step = Math.max(0.055, 0.17 - state.level * 0.01) / speedMul;
        state.tickIn -= dt;
        if (state.tickIn <= 0) {
          state.tickIn = step;
          state.dir = state.nextDir;
          const head = {
            x: state.snake[0].x + state.dir.x,
            y: state.snake[0].y + state.dir.y,
          };
          const hitWall =
            head.x < 0 ||
            head.y < 0 ||
            head.x >= state.cols ||
            head.y >= state.rows;
          const hitSelf = state.snake.some((part) => same(part, head));
          const hitDeck = state.poison.some((part) => same(part, head));
          if (hitWall || hitSelf || hitDeck) {
            state.mode = "over";
            beep("over", settings.sound);
          } else {
            state.snake.unshift(head);
            if (same(head, state.food)) {
              state.score += 10 + state.level * 4;
              state.grow += 1;
              state.level = settings.startLevel + Math.floor(state.score / 80);
              state.food = spawnFree(state);
              if (state.level >= 3 && Math.random() > 0.45) {
                state.poison.push(spawnFree(state, [state.food]));
              }
              beep("score", settings.sound);
              if (state.score > state.best) {
                state.best = state.score;
                saveBest(BEST_KEY, state.best);
              }
            } else if (state.grow > 0) state.grow -= 1;
            else state.snake.pop();
          }
        }
      }

      ctx.fillStyle = usePaper;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = useInk;
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      for (let x = 0; x <= state.cols; x += 1) {
        ctx.moveTo(x * cell, 0);
        ctx.lineTo(x * cell, state.rows * cell);
      }
      for (let y = 0; y <= state.rows; y += 1) {
        ctx.moveTo(0, y * cell);
        ctx.lineTo(state.cols * cell, y * cell);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = useInk;
      for (const part of state.snake) {
        ctx.fillRect(part.x * cell + 1, part.y * cell + 1, cell - 2, cell - 2);
      }
      ctx.font = `600 ${Math.max(9, cell - 10)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = usePaper;
      ctx.fillText(
        "U",
        state.snake[0].x * cell + cell / 2,
        state.snake[0].y * cell + cell / 2 + 1,
      );

      ctx.fillStyle = useInk;
      ctx.fillRect(
        state.food.x * cell + 1,
        state.food.y * cell + 1,
        cell - 2,
        cell - 2,
      );
      ctx.fillStyle = usePaper;
      ctx.fillText(
        "U",
        state.food.x * cell + cell / 2,
        state.food.y * cell + cell / 2 + 1,
      );

      ctx.strokeStyle = useInk;
      for (const item of state.poison) {
        ctx.strokeRect(
          item.x * cell + 2,
          item.y * cell + 2,
          cell - 4,
          cell - 4,
        );
        ctx.fillStyle = useInk;
        ctx.font = `600 ${Math.max(8, cell - 12)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.fillText(
          "D",
          item.x * cell + cell / 2,
          item.y * cell + cell / 2 + 1,
        );
      }

      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = useInk;
      ctx.font = "500 13px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(
        `LV ${state.level}    ${state.score}    HI ${state.best}`,
        16,
        24,
      );

      if (state.mode !== "play") {
        ctx.textAlign = "center";
        ctx.font = "400 28px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(
          state.mode === "over" ? "You ate the deck." : "",
          width / 2,
          height / 2,
        );
        ctx.font = "400 14px ui-sans-serif, system-ui, sans-serif";
        ctx.globalAlpha = 0.6;
        ctx.fillText("Arrows or WASD. Space to play.", width / 2, height - 24);
        ctx.globalAlpha = 1;
      }
    };
    frame = window.requestAnimationFrame(loop);
    if (autoStart) start();

    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [autoStart, ink, paper, settings]);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      className="lost-canvas-wrap"
      aria-label="Snake. Eat USE. Avoid DECK."
    >
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  );
}
