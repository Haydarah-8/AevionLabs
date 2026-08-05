"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useHasHover } from "@/components/anim/useIntro";

type CursorOptions = { text: string; hideOnClick?: boolean };

type CursorContextValue = {
  attach: (el: HTMLElement, options: CursorOptions) => () => void;
};

const CursorContext = createContext<CursorContextValue>({ attach: () => () => {} });

/**
 * The floating "View / Drag / Learn More" cursor chip shown over
 * [data-custom-cursor] regions.
 */
export function CursorProvider({ children }: { children: ReactNode }) {
  const hasHover = useHasHover();
  const [label, setLabel] = useState("View");
  const [visible, setVisible] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 500, damping: 45, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 500, damping: 45, mass: 0.4 });

  useEffect(() => {
    if (!hasHover) return;
    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [hasHover, rawX, rawY]);

  const attach = useCallback(
    (el: HTMLElement, options: CursorOptions) => {
      const show = () => {
        setLabel(options.text);
        x.jump(rawX.get());
        y.jump(rawY.get());
        setVisible(true);
      };
      const hide = () => setVisible(false);
      el.setAttribute("data-custom-cursor", "");
      el.addEventListener("pointerenter", show);
      el.addEventListener("pointerleave", hide);
      if (options.hideOnClick !== false) el.addEventListener("click", hide);
      return () => {
        el.removeAttribute("data-custom-cursor");
        el.removeEventListener("pointerenter", show);
        el.removeEventListener("pointerleave", hide);
        el.removeEventListener("click", hide);
      };
    },
    [rawX, rawY, x, y]
  );

  return (
    <CursorContext.Provider value={{ attach }}>
      {children}
      {hasHover && (
        <motion.div
          id="cursor-svg"
          className="cursor_svg is-work"
          style={{ x, y, translateX: "-50%", translateY: "-50%" }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.24 }}
        >
          <div
            className="cursor_svg_svg"
            data-cursor-svg=""
            style={{ backgroundColor: "var(--color-white)" }}
          >
            <div className="cursor_text u-text-sm" style={{ color: "var(--color-black)" }}>
              {label}
            </div>
          </div>
        </motion.div>
      )}
    </CursorContext.Provider>
  );
}

/** Attach the custom cursor to the element held by `ref`. */
export function useCursorTarget<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: CursorOptions
) {
  const { attach } = useContext(CursorContext);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attach(el, optionsRef.current);
  }, [attach, ref]);
}
