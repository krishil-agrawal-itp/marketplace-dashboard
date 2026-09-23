"use client";

import { ArrowUpRight } from "lucide-react";
import type { MarketplaceSummary } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/status";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/components/Sidebar";

const healthStyles = {
  healthy: "bg-success-soft text-success",
  watch: "bg-warning-soft text-warning",
  at_risk: "bg-error-soft text-error",
} as const;

const healthLabels = {
  healthy: "Healthy",
  watch: "Watch",
  at_risk: "At risk",
} as const;

export function MarketplaceCard({
  summary,
  onSelect,
}: {
  summary: MarketplaceSummary;
  onSelect?: (marketplaceId: string) => void;
}) {
  const { marketplace, liveCount, inReviewCount, mauProxy, lastChange, health } =
    summary;

  function openMarketplace() {
    onSelect?.(marketplace.id);
    scrollToSection("products");
  }

  return (
    <button
      type="button"
      onClick={openMarketplace}
      className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-border bg-surface p-5 text-left transition-all duration-150 hover:border-border-strong hover:shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="type-label">{marketplace.cloud}</p>
          <h3 className="type-heading mt-1 break-words">{marketplace.name}</h3>
        </div>
        <span
          className={cn(
            "type-caption inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-semibold",
            healthStyles[health],
          )}
        >
          {healthLabels[health]}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-2">
        <div>
          <dt className="type-caption">Live</dt>
          <dd className="type-heading mt-0.5 tabular-nums">{liveCount}</dd>
        </div>
        <div>
          <dt className="type-caption">Review</dt>
          <dd className="type-heading mt-0.5 tabular-nums">{inReviewCount}</dd>
        </div>
        <div>
          <dt className="type-caption">MAU</dt>
          <dd className="type-heading mt-0.5 tabular-nums">
            {formatNumber(mauProxy)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-divider pt-3">
        <p className="type-caption">Changed {formatDate(lastChange)}</p>
        <ArrowUpRight className="size-4 shrink-0 text-icon-secondary transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </button>
  );
}
