"use client";

import { useState, useCallback } from "react";

type CopyableEmailProps = {
  /** Address copied to the clipboard (e.g. info@elijahwgroup.com). */
  email: string;
  /** Visible label (can match branding, e.g. Info@…). */
  children: React.ReactNode;
  variant?: "dark" | "light";
};

export function CopyableEmail({
  email,
  children,
  variant = "dark",
}: CopyableEmailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [email]);

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <button
        type="button"
        onClick={handleCopy}
        title="Copy email address"
        className={
          variant === "light"
            ? "rounded-sm font-mono text-sm font-medium text-white underline decoration-white/40 underline-offset-2 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            : "rounded-sm font-mono text-sm font-medium text-black underline decoration-black/35 underline-offset-2 transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
        }
      >
        {children}
      </button>
      <span
        className={`text-xs font-semibold uppercase tracking-wide text-emerald-700 transition-opacity duration-200 ${
          copied ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-live="polite"
        role="status"
      >
        Copied!
      </span>
    </span>
  );
}
