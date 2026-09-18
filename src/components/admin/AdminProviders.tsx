"use client";

import type { ReactNode } from "react";
import { VisitorFeedProvider } from "@/components/admin/VisitorFeedProvider";

export function AdminProviders({ children }: { children: ReactNode }) {
  return <VisitorFeedProvider>{children}</VisitorFeedProvider>;
}
