"use client";

import { PAGE_SIZE } from "@/lib/news/social";

export function FeedPager({
  visibleCount,
  total,
  onLoadMore,
  loading,
}: {
  visibleCount: number;
  total: number;
  onLoadMore: () => void;
  loading?: boolean;
}) {
  const canLoadMore = visibleCount < total || total === 0;
  if (!canLoadMore && total > 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading}
        className="text-[0.8rem] text-[#737373] hover:text-black disabled:opacity-40"
      >
        {loading ? "Loading…" : `Load more (${PAGE_SIZE})`}
      </button>
    </div>
  );
}
