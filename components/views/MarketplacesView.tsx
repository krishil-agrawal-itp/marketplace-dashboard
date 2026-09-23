"use client";

import { useMemo, useState } from "react";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { PageHeader, PageShell } from "@/components/PageShell";
import type { MarketplaceSummary } from "@/lib/data";
import { cn } from "@/lib/utils";

type HealthFilter = "all" | "healthy" | "watch" | "at_risk";

const selectClass =
  "h-10 appearance-none rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:border-border-strong focus:outline-none";

export function MarketplacesView({
  summaries,
}: {
  summaries: MarketplaceSummary[];
}) {
  const [mpHealth, setMpHealth] = useState<HealthFilter>("all");
  const [mpSort, setMpSort] = useState<"name" | "live" | "mau" | "review">(
    "live",
  );

  const filtered = useMemo(() => {
    let rows = [...summaries];
    if (mpHealth !== "all") {
      rows = rows.filter((s) => s.health === mpHealth);
    }
    rows.sort((a, b) => {
      if (mpSort === "name")
        return a.marketplace.name.localeCompare(b.marketplace.name);
      if (mpSort === "live") return b.liveCount - a.liveCount;
      if (mpSort === "review") return b.inReviewCount - a.inReviewCount;
      return b.mauProxy - a.mauProxy;
    });
    return rows;
  }, [summaries, mpHealth, mpSort]);

  return (
    <PageShell>
      <PageHeader
        title="Marketplaces"
        subtitle="Click a card to open products filtered to that marketplace."
      />

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1">
          <span className="type-label">Health</span>
          <select
            className={cn(selectClass, "w-[160px]")}
            value={mpHealth}
            onChange={(e) => setMpHealth(e.target.value as HealthFilter)}
          >
            <option value="all">All</option>
            <option value="healthy">Healthy</option>
            <option value="watch">Watch</option>
            <option value="at_risk">At risk</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="type-label">Sort</span>
          <select
            className={cn(selectClass, "w-[160px]")}
            value={mpSort}
            onChange={(e) => setMpSort(e.target.value as typeof mpSort)}
          >
            <option value="live">Live count</option>
            <option value="mau">MAU</option>
            <option value="review">In review</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {filtered.map((s) => (
          <MarketplaceCard key={s.marketplace.id} summary={s} />
        ))}
      </div>
    </PageShell>
  );
}
