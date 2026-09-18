"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { beep, loadBest, saveBest } from "./canvas";
import { SPEED_MULT, type GameViewProps } from "./settings";

const BEST_KEY = "aevion-lost-type";

const LINES = [
  "SEE IT WORKING",
  "USE IT FIRST",
  "THE DECK IS NOT THE PRODUCT",
  "IF YOU CAN CLICK IT IT COUNTS",
  "KEEP THE BUDGET LOCKED",
  "JUDGE IT IN THE BROWSER",
  "PROTOTYPE FIRST FUND SECOND",
  "STOP FUNDING SLIDES",
  "A MEETING IS NOT A BUILD",
  "SHIP THE THING YOU CAN USE",
];

function lineFor(level: number) {
  const extra = LINES[(level + 3) % LINES.length];
  if (level < 3) return LINES[level % LINES.length];
  if (level < 6) return `${LINES[level % LINES.length]} ${extra.split(" ")[0]}`;
  return `${LINES[level % LINES.length]} ${extra}`;
}

function windowFor(level: number, speed: number) {
  return Math.max(4.2, 11.5 - level * 0.55) / speed;
}

export function TypeGame({ settings, ink, paper, autoStart }: GameViewProps) {
  const [mode, setMode] = useState<"ready" | "play" | "over">("ready");
  const [level, setLevel] = useState(settings.startLevel);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState<number>(settings.lives);
  const [best, setBest] = useState(0);
  const [typed, setTyped] = useState("");
  const [left, setLeft] = useState(10);
  const [flash, setFlash] = useState(false);
  const target = useMemo(() => lineFor(level), [level]);
  const totalRef = useRef(10);
  const typedRef = useRef("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBest(loadBest(BEST_KEY));
  }, []);

  const begin = (nextLevel: number, nextScore: number, nextLives: number) => {
    const limit = windowFor(nextLevel, SPEED_MULT[settings.speed]);
    totalRef.current = limit;
    typedRef.current = "";
    setTyped("");
    setLevel(nextLevel);
    setScore(nextScore);
    setLives(nextLives);
    setLeft(limit);
    setMode("play");
    wrapRef.current?.focus();
  };

  useEffect(() => {
    if (autoStart) begin(settings.startLevel, 0, settings.lives);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, [autoStart]);

  useEffect(() => {
    if (mode !== "play") return;
    let last = performance.now();
    let frame = 0;
    let expired = false;
    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setLeft((value) => {
        const next = value - dt;
        if (next <= 0) {
          if (!expired) {
            expired = true;
            queueMicrotask(() => {
              setLives((livesNow) => {
                const remain = livesNow - 1;
                beep("over", settings.sound);
                if (remain <= 0) setMode("over");
                else window.setTimeout(() => begin(level, score, remain), 280);
                return Math.max(0, remain);
              });
            });
          }
          return 0;
        }
        return next;
      });
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [level, mode, score, settings.sound]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return;
      if (mode !== "play") {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          begin(settings.startLevel, 0, settings.lives);
        }
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        typedRef.current = typedRef.current.slice(0, -1);
        setTyped(typedRef.current);
        return;
      }
      if (event.key.length !== 1) return;
      event.preventDefault();
      const next = typedRef.current + event.key.toUpperCase();
      const want = target.slice(0, next.length);
      if (next !== want) {
        setFlash(true);
        beep("over", settings.sound);
        window.setTimeout(() => setFlash(false), 120);
        return;
      }
      typedRef.current = next;
      setTyped(next);
      beep("hit", settings.sound);
      if (next === target) {
        const gain = 40 + Math.round(left * 12) + level * 8;
        const nextScore = score + gain;
        if (nextScore > best) {
          setBest(nextScore);
          saveBest(BEST_KEY, nextScore);
        }
        setScore(nextScore);
        beep("score", settings.sound);
        window.setTimeout(() => begin(level + 1, nextScore, lives), 220);
      }
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [best, left, level, lives, mode, score, settings, target]);

  const ratio = Math.max(0, left / totalRef.current);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      className={`lost-type${flash ? " is-flash" : ""}`}
      style={{ color: ink, background: paper }}
      aria-label="Type the sentence. Beat the meeting."
    >
      <p className="lost-play-hud">
        LV {level} · {score} · HI {best} · LIVES {lives}
      </p>
      <div className="lost-type-timer" aria-hidden>
        <span style={{ transform: `scaleX(${mode === "play" ? ratio : 0})` }} />
      </div>
      {mode === "play" ? (
        <p className="lost-type-line" aria-live="polite">
          <span>{typed}</span>
          <span className="is-rest">{target.slice(typed.length)}</span>
        </p>
      ) : (
        <p className="lost-type-line">
          {mode === "over"
            ? "THE MEETING WON THE SENTENCE."
            : "TYPE THE PRODUCT."}
        </p>
      )}
      <p className="lost-type-hint">
        {mode === "play"
          ? "Type the line. No decks. No typos."
          : "Space to try again. Esc to leave."}
      </p>
    </div>
  );
}
