"use client";

import { PlainHeading, PlainRow } from "@/components/admin/plain";
import { type PageStat } from "@/data/analytics";

/**
 * The pages people actually read.
 *
 * A list rather than the four-column table it was: views, average time and
 * bounce were three right-aligned numeric columns competing for the same
 * attention, and only the first is the reason anyone looks at this. The other
 * two sit under the title as ordinary text, and the rule under each row shows
 * the share of traffic without spending a column on it.
 */
export function TopPages({ pages }: { pages: PageStat[] }) {
  if (!pages?.length) {
    return (
      <div>
        <PlainHeading>Top pages</PlainHeading>
        <p className="py-10 text-center text-[0.95rem] text-[#737373]">
          No page views logged yet.
        </p>
      </div>
    );
  }

  const most = Math.max(...pages.map((page) => page.views), 1);

  return (
    <div>
      <PlainHeading note={`${pages.length} pages`}>Top pages</PlainHeading>
      <ul>
        {pages.map((page) => (
          <PlainRow
            key={page.path}
            primary={page.title || page.path}
            secondary={
              <>
                {page.path}
                {page.avgTime ? ` · ${page.avgTime} average` : ""}
                {typeof page.bounceRate === "number"
                  ? ` · ${page.bounceRate}% left straight away`
                  : ""}
              </>
            }
            value={page.views.toLocaleString()}
            bar={page.views / most}
          />
        ))}
      </ul>
    </div>
  );
}
