"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/components/admin/Modal";
import { ACCENT } from "@/components/admin/ui";
import { glossaryEntry, type GlossaryEntry } from "@/lib/news/glossary";

/**
 * The explain layer.
 *
 * Every derived number on this desk — spread, balance, reach, loaded share —
 * is the output of a decision somebody made, and a reader who has to guess at
 * that decision still acts on the number. Anything labelled can be pressed to
 * see what it is, how it was computed, and where it stops being reliable.
 *
 * It is deliberately a separate channel from the data drill-downs: pressing a
 * *value* opens the articles behind it, pressing its *label* opens what the
 * measure means. Collapsing the two would make one of them unreachable.
 */

type ExplainContext = {
  open: (id: string) => void;
};

const Ctx = createContext<ExplainContext | null>(null);

const MICRO =
  "text-[0.65rem] text-[#737373] font-semibold";

export function ExplainProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<string[]>([]);
  const current = stack[stack.length - 1] ?? null;

  const open = useCallback((id: string) => {
    setStack((s) => [...s, id]);
  }, []);
  const back = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const close = useCallback(() => setStack([]), []);

  const value = useMemo(() => ({ open }), [open]);
  const entry = current ? glossaryEntry(current) : undefined;
  const beneath = stack.length > 1 ? glossaryEntry(stack[stack.length - 2]) : undefined;

  return (
    <Ctx.Provider value={value}>
      {children}
      <Modal
        open={Boolean(entry)}
        onClose={close}
        onBack={stack.length > 1 ? back : undefined}
        backLabel={beneath?.term}
        eyebrow={<span>Definition</span>}
        title={entry?.term ?? ""}
      >
        {entry ? <ExplainBody entry={entry} onOpen={open} /> : null}
      </Modal>
    </Ctx.Provider>
  );
}

function ExplainBody({
  entry,
  onOpen,
}: {
  entry: GlossaryEntry;
  onOpen: (id: string) => void;
}) {
  const related = (entry.seeAlso ?? [])
    .map((id) => glossaryEntry(id))
    .filter((found): found is GlossaryEntry => Boolean(found));

  return (
    <div className="max-w-2xl space-y-10">
      <p className="text-lg leading-relaxed text-[#111]">{entry.short}</p>

      <section>
        <h3 className={`${MICRO} mb-3`}>How it is worked out</h3>
        <p className="text-[0.95rem] leading-[1.75] text-[#b8b8c0]">
          {entry.method}
        </p>
      </section>

      <section className="border-t border-black/10 pt-8">
        <h3 className={`${MICRO} mb-3`} style={{ color: "#c9963f" }}>
          What it cannot tell you
        </h3>
        <p className="text-[0.95rem] leading-[1.75] text-[#b8b8c0]">
          {entry.caveat}
        </p>
      </section>

      {related.length ? (
        <section className="border-t border-black/10 pt-8">
          <h3 className={`${MICRO} mb-3`}>Related</h3>
          <ul className="space-y-2.5">
            {related.map((other) => (
              <li key={other.id}>
                <button
                  type="button"
                  onClick={() => onOpen(other.id)}
                  className="block text-left transition-opacity hover:opacity-75"
                >
                  <span className="text-sm font-semibold text-[#111]">
                    {other.term}
                  </span>
                  <span className="ml-3 text-[0.8rem] text-[#737373]">
                    {other.short}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {entry.source ? (
        <p className="border-t border-black/10 pt-8 text-[0.65rem] text-[#a3a3a3]">
          {entry.source}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Wraps a label so pressing it explains the measure.
 *
 * Renders a real button, so it is reachable by keyboard and announced as one.
 * An unknown id renders the children untouched rather than a dead control —
 * a label that looks pressable and does nothing is worse than a plain label.
 */
export function Explain({
  id,
  children,
  className = "",
  underline = true,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  underline?: boolean;
}) {
  const ctx = useContext(Ctx);
  const entry = glossaryEntry(id);

  if (!ctx || !entry) return <>{children}</>;

  return (
    <button
      type="button"
      onClick={(event) => {
        // Labels often sit inside other clickable rows; explaining a term must
        // not also trigger the row's own action.
        event.stopPropagation();
        ctx.open(id);
      }}
      title={entry.short}
      aria-label={`${entry.term} — what this means`}
      className={`text-left transition-colors hover:text-[#ffffff] ${
        underline
          ? "decoration-dotted decoration-from-font underline-offset-4 hover:underline"
          : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

/** The same affordance as a standalone marker, where wrapping is awkward. */
export function ExplainMark({ id }: { id: string }) {
  const ctx = useContext(Ctx);
  const entry = glossaryEntry(id);
  if (!ctx || !entry) return null;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        ctx.open(id);
      }}
      title={entry.short}
      aria-label={`${entry.term} — what this means`}
      className="ml-1.5 inline-flex h-3 w-3 shrink-0 translate-y-[-1px] items-center justify-center rounded-full border text-[0.5rem] font-bold leading-none transition-colors"
      style={{ borderColor: "#3e3e49", color: "#5a5a66" }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = ACCENT.base;
        event.currentTarget.style.color = ACCENT.bright;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = "#3e3e49";
        event.currentTarget.style.color = "#5a5a66";
      }}
    >
      ?
    </button>
  );
}
