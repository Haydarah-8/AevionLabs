"use client";

import { useState, type ReactNode } from "react";
import { AdminMediaRail } from "@/components/admin/AdminMediaRail";
import { FeedPager } from "@/components/admin/FeedPager";
import {
  PAGE_SIZE,
  SOCIAL_PLATFORMS,
  visibleSlice,
  type SocialPlatform,
} from "@/lib/news/social";

function PlatformSection<T>({
  items,
  label,
  loading,
  render,
  onLoadMore,
}: {
  items: T[];
  label: string;
  loading?: boolean;
  render: (item: T) => ReactNode;
  onLoadMore: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const slice = visibleSlice(items, visibleCount);

  return (
    <section className="space-y-2">
      {items.length ? (
        <AdminMediaRail label={label}>
          {slice.map((item) => render(item))}
        </AdminMediaRail>
      ) : (
        <div>
          <p className="mb-4 text-[0.8rem] text-[#737373]">
            {label}
          </p>
          <p className="text-sm font-light text-[#737373]">
            No posts yet. Load more to scrape this feed.
          </p>
        </div>
      )}
      <FeedPager
        visibleCount={visibleCount}
        total={items.length}
        onLoadMore={() => {
          if (visibleCount < items.length) {
            setVisibleCount((count) => count + PAGE_SIZE);
            return;
          }
          onLoadMore();
          setVisibleCount((count) => count + PAGE_SIZE);
        }}
        loading={loading}
      />
    </section>
  );
}

export function AdminSocialSections<T>({
  groups,
  loading,
  render,
  onLoadMore,
}: {
  groups: Record<SocialPlatform, T[]>;
  loading?: boolean;
  render: (item: T, platform: SocialPlatform) => ReactNode;
  onLoadMore: () => void;
}) {
  return (
    <div className="space-y-10">
      {SOCIAL_PLATFORMS.map((platform) => (
        <PlatformSection
          key={platform.id}
          items={groups[platform.id]}
          label={platform.label}
          loading={loading}
          onLoadMore={onLoadMore}
          render={(item) => render(item, platform.id)}
        />
      ))}
    </div>
  );
}
