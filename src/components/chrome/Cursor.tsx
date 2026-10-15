"use client";

import {
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from "react";

type CursorOptions = { text: string; hideOnClick?: boolean };

type CursorContextValue = {
  attach: (el: HTMLElement, options: CursorOptions) => () => void;
};

const CursorContext = createContext<CursorContextValue>({
  attach: () => () => {},
});

/** Custom cursor removed — pass-through only (keeps call sites compiling). */
export function CursorProvider({ children }: { children: ReactNode }) {
  return (
    <CursorContext.Provider value={{ attach: () => () => {} }}>
      {children}
    </CursorContext.Provider>
  );
}

/** No-op: custom cursor UI is disabled. */
export function useCursorTarget<T extends HTMLElement>(
  _ref: RefObject<T | null>,
  _options: CursorOptions,
) {
  useContext(CursorContext);
}
