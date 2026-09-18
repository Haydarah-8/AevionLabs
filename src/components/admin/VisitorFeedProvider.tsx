"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useVisitorFeed } from "@/components/admin/useVisitorFeed";

type VisitorFeedValue = ReturnType<typeof useVisitorFeed>;

const VisitorFeedContext = createContext<VisitorFeedValue | null>(null);

export function VisitorFeedProvider({ children }: { children: ReactNode }) {
  const value = useVisitorFeed(600, 30_000);
  return (
    <VisitorFeedContext.Provider value={value}>
      {children}
    </VisitorFeedContext.Provider>
  );
}

export function useVisitorFeedContext(): VisitorFeedValue {
  const value = useContext(VisitorFeedContext);
  if (!value) {
    throw new Error("useVisitorFeedContext requires VisitorFeedProvider");
  }
  return value;
}
