"use client";

import type { ReactNode } from "react";

/**
 * Shared admin surfaces for the dark control shell.
 * Hierarchy comes from weight, size, and space — not uppercase mono labels.
 */

export function PlainHeading({
  children,
  note,
}: {
  children: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline gap-x-4 border-b border-white/[0.08] pb-2.5">
      <h3 className="text-[1.05rem] font-medium text-white">{children}</h3>
      {note ? (
        <span className="text-[0.82rem] text-white/45">{note}</span>
      ) : null}
    </div>
  );
}

export function PlainPanel({
  title,
  note,
  children,
}: {
  title: ReactNode;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h4 className="text-[0.9rem] font-medium text-white/70">{title}</h4>
        {note ? (
          <span className="text-[0.8rem] text-white/40">{note}</span>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function PlainFigure({
  label,
  value,
  note,
  small,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
      <p className="text-[0.8rem] text-white/45">{label}</p>
      <p
        className={`mt-1 font-medium leading-snug text-white ${
          small ? "text-[0.95rem]" : "text-[1.35rem]"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {note ? (
        <p className="mt-1 text-[0.78rem] text-white/40">{note}</p>
      ) : null}
    </div>
  );
}

export function PlainField({
  label,
  value,
  wrap,
}: {
  label: string;
  value: ReactNode;
  wrap?: boolean;
}) {
  const empty = value === "" || value === null || value === undefined;
  return (
    <div>
      <p className="text-[0.8rem] leading-snug text-white/45">{label}</p>
      <p
        className={`mt-1 text-[0.95rem] leading-snug text-white ${
          wrap ? "break-all" : ""
        }`}
      >
        {empty ? <span className="text-white/35">—</span> : value}
      </p>
    </div>
  );
}

export function PlainPill({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[0.88rem] transition-colors ${
        active
          ? "bg-white font-medium text-[#0d1730]"
          : "text-white/50 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {children}
      {count !== undefined ? (
        <span
          className={`ml-2 tabular-nums ${
            active ? "text-[#0d1730]/60" : "text-white/40"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function PlainSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-[0.8rem] text-white/45">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-[12rem] rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[0.88rem] text-white focus:border-white/30 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0d1730]">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export const plainControl =
  "text-[0.88rem] text-white/45 transition-colors hover:text-white";

export const plainHoverRow = [
  "relative -mx-3 rounded-lg px-3 transition-colors hover:bg-white/[0.04]",
  "after:pointer-events-none after:absolute after:inset-x-3 after:bottom-0",
  "after:h-px after:bg-white/[0.08] last:after:hidden",
].join(" ");

export const plainHoverTableRow = "plain-row-table";

export function PlainRow({
  primary,
  secondary,
  value,
  bar,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  value: ReactNode;
  bar?: number;
}) {
  return (
    <li className="border-b border-white/[0.08] py-2.5 last:border-0">
      <div className="flex items-baseline justify-between gap-6">
        <span className="min-w-0">
          <span className="block truncate text-[0.9rem] text-white/75">
            {primary}
          </span>
          {secondary ? (
            <span className="mt-0.5 block truncate text-[0.8rem] text-white/40">
              {secondary}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-[0.9rem] tabular-nums text-white/45">
          {value}
        </span>
      </div>
      {typeof bar === "number" ? (
        <div className="mt-2 h-[3px] w-full rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-white/70"
            style={{ width: `${Math.max(2, Math.min(100, bar * 100))}%` }}
          />
        </div>
      ) : null}
    </li>
  );
}
