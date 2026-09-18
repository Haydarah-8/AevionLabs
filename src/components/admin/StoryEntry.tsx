"use client";

import { memo } from "react";
import { LeanTag } from "@/components/admin/Spectrum";
import { leanForOutlet } from "@/lib/news/lean";
import type { NewsroomCluster, NewsroomItem } from "@/lib/news/newsroom";
import {
  plainHoverRow,
} from "@/components/admin/plain";

const MICRO =
  "text-[0.8rem] text-[#737373] font-semibold";
const ACTION =
  "text-[0.8rem] font-semibold text-[#737373] transition-colors hover:text-black disabled:opacity-30 disabled:hover:text-[#737373]";

/**
 * Drafting is the one thing the desk exists to do.
 *
 * It used to sit in the row of small grey text links under the snippet,
 * indistinguishable from Dismiss and Source, so the primary action looked like
 * a footnote. It is now a real button at the top of the row, sized to be hit
 * without aiming and coloured like the only thing on the row you are meant to
 * press.
 */
const DRAFT =
  "shrink-0 border px-4 py-2 text-[0.85rem] transition-colors disabled:cursor-not-allowed";
const DRAFT_READY =
  "border-[#ffffff]/45 bg-[#ffffff]/10 text-[#ffffff] hover:bg-[#ffffff] hover:text-black";
const DRAFT_DONE =
  "border-black/10 bg-transparent text-[#a3a3a3] hover:border-black/10";

function when(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  if (diff < 60 * 60 * 1000) {
    return `${Math.max(1, Math.round(diff / 60000))}m`;
  }
  if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / 3600000)}h`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/**
 * One row in the wire. The row itself stays a summary — the whole headline is
 * the control that opens the story full screen, where the text and the full
 * spread of coverage are shown together.
 */
export const StoryEntry = memo(function StoryEntry({
  item,
  cluster,
  checked,
  selectable,
  busy,
  onOpen,
  onToggle,
  onDraft,
  onDismiss,
}: {
  item: NewsroomItem;
  cluster?: NewsroomCluster;
  checked: boolean;
  selectable: boolean;
  busy: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onDraft: () => void;
  onDismiss: () => void;
}) {
  const rating = leanForOutlet(item);
  const outlets = cluster?.sourceCount ?? 1;

  return (
    <li
      data-entry={item.key}
      className={`py-5 transition-colors ${plainHoverRow}`}
    >
      <div className="flex items-start gap-4">
        {selectable ? (
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            disabled={item.imported}
            className="mt-1.5 h-3.5 w-3.5 shrink-0 accent-white"
            aria-label={`Select ${item.title}`}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div
            className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 ${MICRO}`}
          >
            <span className="text-[#737373]">{item.source}</span>
            <LeanTag lean={rating.lean} state={rating.stateControlled} />
            <span className="text-[#a3a3a3]">
              {when(item.publishedAt)}
            </span>
            {outlets > 1 ? (
              <span className="text-[#737373]">
                {outlets} outlets
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="mt-1.5 block w-full text-left text-[0.95rem] font-semibold leading-snug text-[#111] transition-colors hover:text-black"
          >
            {item.title}
          </button>

          {item.snippet ? (
            <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-relaxed text-[#737373]">
              {item.snippet}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onDraft}
          disabled={busy || item.imported}
          className={`${DRAFT} ${item.imported ? DRAFT_DONE : DRAFT_READY}`}
          title={
            item.imported
              ? "A draft already exists for this story"
              : "Create a draft and open it in the editor"
          }
        >
          {item.imported ? "Drafted" : busy ? "Drafting…" : "Draft →"}
        </button>
      </div>

      {/* The secondary actions stay small and out of the way; only Draft is
          meant to catch the eye. Indented to line up with the headline. */}
      <div
        className={`mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 ${
          selectable ? "pl-[1.875rem]" : ""
        }`}
      >
        <button type="button" onClick={onOpen} className={ACTION}>
          Open
        </button>
        <button
          type="button"
          onClick={onDismiss}
          disabled={busy}
          className={ACTION}
        >
          {outlets > 1 ? `Dismiss ${outlets}` : "Dismiss"}
        </button>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className={ACTION}
        >
          Source
        </a>
      </div>
    </li>
  );
});
