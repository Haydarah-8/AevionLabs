"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Coordinates "hero intro" timing:
 *  - first load → after the loader finishes
 *  - client navigations → shortly after the transition panel starts revealing
 */
type IntroContextValue = {
  introToken: number;
  fireIntro: () => void;
};

export const IntroContext = createContext<IntroContextValue>({
  introToken: 0,
  fireIntro: () => {},
});

export function useIntroToken() {
  return useContext(IntroContext).introToken;
}

/** Runs `effect` once the page intro fires (loader done / transition revealed). */
export function useIntroEffect(effect: () => void | (() => void)) {
  const { introToken } = useContext(IntroContext);
  const played = useRef(false);
  const cleanup = useRef<void | (() => void)>(undefined);
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    if (introToken === 0 || played.current) return;
    played.current = true;
    cleanup.current = effectRef.current();
    return () => {
      if (typeof cleanup.current === "function") cleanup.current();
    };
  }, [introToken]);
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export function useHasHover() {
  const [hasHover, setHasHover] = useState(true);
  useEffect(() => {
    setHasHover(!window.matchMedia("(hover: none)").matches);
  }, []);
  return hasHover;
}

/** Waits for webfonts so line-splitting measures the final layout. */
export function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

export function useStableCallback<T extends (...args: never[]) => unknown>(cb: T) {
  const ref = useRef(cb);
  ref.current = cb;
  return useCallback((...args: Parameters<T>) => ref.current(...args), []);
}
