"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  aggregateVisitorData,
  type AggregatedData,
} from "@/lib/analytics-aggregator";
import type { VisitorRecord } from "@/lib/tracker-store";

export function useVisitorFeed(limit = 1000, intervalMs = 10000) {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/visitors?limit=${limit}`, {
        credentials: "same-origin",
      });
      if (res.status === 401) {
        setVisitors([]);
        setAggregated(null);
        return;
      }
      const data = await res.json();
      if (data.visitors) {
        setVisitors(data.visitors);
        setAggregated(aggregateVisitorData(data.visitors));
      }
    } catch (err) {
      console.error("Failed to fetch visitor data", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, intervalMs);
    return () => clearInterval(interval);
  }, [fetchData, intervalMs]);

  const liveCount = aggregated?.overviewStats.liveVisitors ?? 0;
  const uniqueIPs = useMemo(
    () => new Set(visitors.map((v) => v.ip)).size,
    [visitors],
  );

  return {
    visitors,
    aggregated,
    loading,
    fetchData,
    liveCount,
    uniqueIPs,
    totalEvents: visitors.length,
  };
}
