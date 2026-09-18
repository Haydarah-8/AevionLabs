"use client";

import { PlainFigure, PlainHeading, PlainRow } from "@/components/admin/plain";

export type BreakdownRow = {
  id: string;
  label: string;
  sub?: string;
  value: number;
};

/**
 * The whole of a ranked list, rather than its top five.
 *
 * Every panel on the overview shows a handful of rows because a dashboard has
 * to fit on a screen. The rows below them are not less real, only less
 * convenient, and a truncated list read as a complete one is how a long tail
 * becomes invisible.
 */
export function BreakdownModalBody({
  rows,
  unit = "views",
  note,
}: {
  rows: BreakdownRow[];
  unit?: string;
  note?: string;
}) {
  if (!rows.length) {
    return (
      <p className="text-[0.95rem] text-[#737373]">Nothing recorded yet.</p>
    );
  }

  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const top = rows[0]?.value ?? 1;

  return (
    <div className="space-y-12">
      <section className="grid grid-cols-3 gap-4">
        <PlainFigure label="Entries" value={rows.length} />
        <PlainFigure label={`Total ${unit}`} value={total} />
        <PlainFigure
          label="In the largest"
          value={`${Math.round((top / Math.max(1, total)) * 100)}%`}
        />
      </section>

      {/* One list, not a chart above a table. The rule under each row carries
          the proportion, so the long tail is read the same way as the head
          rather than being relegated to an afterthought below a graph. */}
      <section>
        <PlainHeading note={`${rows.length} in total`}>
          Every entry
        </PlainHeading>
        <ul>
          {rows.map((row) => (
            <PlainRow
              key={row.id}
              primary={row.label}
              secondary={row.sub}
              value={row.value.toLocaleString()}
              bar={row.value / top}
            />
          ))}
        </ul>
      </section>

      {note ? (
        <p className="max-w-2xl border-t border-black/10 pt-8 text-[0.82rem] leading-relaxed text-[#737373]">
          {note}
        </p>
      ) : null}
    </div>
  );
}
