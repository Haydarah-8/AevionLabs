"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CmsCollection, CmsEntry } from "@/features/website-factory/cms/types";
import type { BindContext } from "@/features/website-factory/cms/bindings";

const CmsContext = createContext<BindContext>({
  collections: [],
  entry: null,
  business: null,
});

export function CmsProvider({
  collections,
  business,
  children,
}: {
  collections: CmsCollection[];
  business?: BindContext["business"];
  children: ReactNode;
}) {
  return (
    <CmsContext.Provider
      value={{ collections, business: business || null, entry: null }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function CmsEntryProvider({
  entry,
  children,
}: {
  entry: CmsEntry;
  children: ReactNode;
}) {
  const parent = useContext(CmsContext);
  return (
    <CmsContext.Provider value={{ ...parent, entry }}>
      {children}
    </CmsContext.Provider>
  );
}

export function useCmsContext(): BindContext {
  return useContext(CmsContext);
}
