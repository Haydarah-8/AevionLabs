"use client";

import { useEffect } from "react";
import { ChromeError } from "@/components/site/lost/ChromeError";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site/error]", error);
  }, [error]);

  return <ChromeError kind="error" />;
}
