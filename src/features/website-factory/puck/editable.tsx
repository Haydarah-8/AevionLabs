"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { registerOverlayPortal } from "@puckeditor/core";

/** Ask the studio chrome to focus a Puck field in the inspector. */
export function focusStudioField(field: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("ae-focus-field", { detail: { field } }),
  );
}

/**
 * Makes an element clickable under Puck's component overlay so images / media
 * can be targeted (not just the parent section).
 */
export function Focusable({
  field,
  className,
  style,
  children,
  as: Tag = "div",
}: {
  field: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  as?: "div" | "span" | "figure";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerOverlayPortal(el, { disableDrag: true });
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={style}
      data-ae-field={field}
      onClick={(event) => {
        event.stopPropagation();
        focusStudioField(field);
      }}
    >
      {children}
    </Tag>
  );
}
