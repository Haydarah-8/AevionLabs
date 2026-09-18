"use client";

import { useEffect, useRef, type ReactNode } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Every open dialog, oldest first.
 *
 * Dialogs can stack — pressing a term inside a topic opens its definition over
 * the top — and each one listens for Escape on the document. Without a shared
 * stack a single Escape closed the whole tower at once, because both handlers
 * fired on the same keypress. Only the last entry responds.
 */
const OPEN_STACK: symbol[] = [];

/**
 * A full-screen overlay in the page's own colour, so opening one reads as
 * moving into a view rather than stacking a card on top of one.
 *
 * It behaves like a dialog should: focus moves in on open and returns to the
 * trigger on close, Tab is trapped inside, Escape closes, and the page behind
 * stops scrolling.
 */
export function Modal({
  open,
  onClose,
  onBack,
  backLabel,
  eyebrow,
  title,
  actions,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Set when this view was opened from another, to step back one level. */
  onBack?: () => void;
  backLabel?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  /**
   * There was briefly a `chrome` prop here choosing between a serif title over
   * a small-caps eyebrow and this. Every surface that opens a dialog is plain
   * now, so the other branch had no callers and the choice was no longer a
   * choice.
   */
  const quietControl =
    "text-[0.85rem] text-white/45 transition-colors hover:text-white";
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  /** This dialog's identity in the shared stack. */
  const tokenRef = useRef<symbol>(Symbol("modal"));

  // Callers pass an inline arrow, so its identity changes on every render.
  // Holding it in a ref keeps the effect below keyed on `open` alone —
  // otherwise it re-runs mid-session and re-captures the element to restore
  // focus to as a button inside the dialog, losing the real trigger.
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const token = tokenRef.current;
    OPEN_STACK.push(token);
    const isTopmost = () => OPEN_STACK[OPEN_STACK.length - 1] === token;

    // Move focus into the dialog so the keyboard starts inside it.
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panelRef.current)?.focus();

    function onKey(event: KeyboardEvent) {
      // A dialog underneath one that is open must ignore the keyboard
      // entirely, or Escape collapses the whole stack in a single press and
      // Tab is fought over by two focus traps.
      if (!isTopmost()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = [
        ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((node) => node.offsetParent !== null);
      if (!nodes.length) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    }

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      const index = OPEN_STACK.lastIndexOf(token);
      if (index >= 0) OPEN_STACK.splice(index, 1);
      // Only the last dialog to close may release the page scroll; a nested
      // one closing would otherwise unlock the page behind the dialog still
      // on screen.
      if (!OPEN_STACK.length) document.body.style.overflow = overflow;
      restoreRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex flex-col bg-[#0a0a0f] text-zinc-100"
      ref={panelRef}
      tabIndex={-1}
    >
      <header className="shrink-0 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-10 px-6 py-8 sm:px-12">
          <div className="min-w-0">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className={`mb-3 ${quietControl}`}
              >
                ← {backLabel ?? "Back"}
              </button>
            ) : null}
            {eyebrow ? (
              <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.85rem] text-white/45">
                {eyebrow}
              </div>
            ) : null}
            <h2 className="text-[1.6rem] font-medium leading-snug text-white">
              {title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-6">
            {actions}
            <button type="button" onClick={onClose} className={quietControl}>
              Close
            </button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Wider and taller than the page behind it: a modal that only just
            fits its contents reads as a dialog box, not as a view. */}
        <div className="mx-auto max-w-6xl px-6 py-14 sm:px-12">{children}</div>
      </div>

      {footer ? (
        <footer className="shrink-0 border-t border-white/[0.04]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 sm:px-12">
            {footer}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
