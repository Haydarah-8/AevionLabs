"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/**
 * Seamless horizontal marquee that keeps auto-scrolling and can be
 * dragged / flicked on touch and mouse.
 */
export function DragMarquee({
  children,
  className,
  trackClassName,
  speed = 36,
  style,
}: {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  /** Pixels per second while idle. */
  speed?: number;
  style?: CSSProperties;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reduced.current = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let raf = 0;
    let prev = performance.now();

    const loop = (now: number) => {
      raf = window.requestAnimationFrame(loop);
      const track = trackRef.current;
      if (!track) return;
      const half = track.scrollWidth / 2;
      if (half < 1) return;

      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;

      if (!dragging.current) {
        if (Math.abs(velocity.current) > 4) {
          offset.current += velocity.current * dt;
          velocity.current *= 0.94;
        } else if (!reduced.current) {
          velocity.current = 0;
          offset.current -= speed * dt;
        }
      }

      while (offset.current <= -half) offset.current += half;
      while (offset.current > 0) offset.current -= half;
      track.style.transform = `translate3d(${offset.current}px,0,0)`;
    };

    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [speed]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    dragging.current = true;
    moved.current = false;
    velocity.current = 0;
    lastX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = "grabbing";
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const dx = event.clientX - lastX.current;
    lastX.current = event.clientX;
    if (Math.abs(dx) > 2) moved.current = true;
    offset.current += dx;
    velocity.current = dx * 48;
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    event.currentTarget.style.cursor = "grab";
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  }

  function onClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    if (!moved.current) return;
    event.preventDefault();
    event.stopPropagation();
    moved.current = false;
  }

  return (
    <div
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      style={{
        touchAction: "pan-y",
        cursor: "grab",
        userSelect: "none",
        ...style,
      }}
    >
      <div
        ref={trackRef}
        className={trackClassName}
        style={{ willChange: "transform", transform: "translate3d(0,0,0)" }}
      >
        {children}
      </div>
    </div>
  );
}
