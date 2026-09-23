"use client";

import { useMemo, useState } from "react";
import { Download, FilterX, Search } from "lucide-react";
import { DeploymentMatrix } from "@/components/DeploymentMatrix";
import { KpiStrip, type KpiAction } from "@/components/KpiStrip";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { PageHeader } from "@/components/PageShell";
import { ProductTable } from "@/components/ProductTable";
import { ProgressUpdatesSection } from "@/components/ProgressUpdatesSection";
import { RiskList } from "@/components/RiskList";
import type {
  ExecutiveKpis,
  MarketplaceSummary,
  ProductRow,
} from "@/lib/data";
import type { ProgressUpdate, Risk, DailyProgressEntry } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/status";
import { cn } from "@/lib/utils";

type SortKey =
  | "name-asc"
  | "name-desc"
  | "mau-desc"
  | "mau-asc"
  | "spend-desc"
  | "spend-asc"
  | "success-desc"
  | "success-asc"
  | "updated-desc";

type RiskFilter = "all" | "flagged" | "clear";
type HealthFilter = "all" | "healthy" | "watch" | "at_risk";

const selectClass =
  "h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:border-border-strong focus:outline-none";

export function DashboardApp({
  kpis,
  summaries,
  products,
  risks,
  owners,
  categories,
  marketplaces,
  progressUpdates,
  dailyProgressEntries,
  productOptions,
  generatedAt,
}: {
  kpis: ExecutiveKpis;
  summaries: MarketplaceSummary[];
  products: ProductRow[];
  risks: Risk[];
  owners: string[];
  categories: string[];
  marketplaces: { id: string; name: string }[];
  progressUpdates: ProgressUpdate[];
  dailyProgressEntries: DailyProgressEntry[];
  productOptions: { id: string; name: string }[];
  generatedAt: string;
}) {
  const [owner, setOwner] = useState("");
  const [marketplace, setMarketplace] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [sort, setSort] = useState<SortKey>("mau-desc");
  const [query, setQuery] = useState("");
  const [mpHealth, setMpHealth] = useState<HealthFilter>("all");
  const [mpSort, setMpSort] = useState<"name" | "live" | "mau" | "review">("live");

  function applyKpiAction(_key: string, action: KpiAction) {
    if (action.type === "filter-status") {
      setStatus(action.status);
      setRiskFilter("all");
    }
    if (action.type === "sort") {
      setSort(action.sort as SortKey);
    }
  }

  const filteredMarketplaces = useMemo(() => {
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

  const filteredProducts = useMemo(() => {
    let rows = products.filter((row) => {
      if (owner && row.product.owner !== owner) return false;
      if (category && row.product.category !== category) return false;
      if (status && row.bestStatus !== status) return false;
      if (marketplace && !row.marketplaceIds.includes(marketplace)) return false;
      if (riskFilter === "flagged" && !row.hasRisk) return false;
      if (riskFilter === "clear" && row.hasRisk) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay =
          `${row.product.name} ${row.product.owner} ${row.product.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.product.name.localeCompare(b.product.name);
        case "name-desc":
          return b.product.name.localeCompare(a.product.name);
        case "mau-asc":
          return a.mau - b.mau;
        case "mau-desc":
          return b.mau - a.mau;
        case "spend-asc":
          return a.spendMtd - b.spendMtd;
        case "spend-desc":
          return b.spendMtd - a.spendMtd;
        case "success-asc":
          return (a.successRate ?? -1) - (b.successRate ?? -1);
        case "success-desc":
          return (b.successRate ?? -1) - (a.successRate ?? -1);
        case "updated-desc":
          return b.product.lastUpdated.localeCompare(a.product.lastUpdated);
        default:
          return 0;
      }
    });

    return rows;
  }, [
    products,
    owner,
    category,
    status,
    marketplace,
    riskFilter,
    query,
    sort,
  ]);

  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      if (marketplace && r.relatedMarketplaceId !== marketplace) return false;
      return r.status !== "resolved";
    });
  }, [risks, marketplace]);

  function clearFilters() {
    setOwner("");
    setMarketplace("");
    setStatus("");
    setCategory("");
    setRiskFilter("all");
    setSort("mau-desc");
    setQuery("");
    setMpHealth("all");
    setMpSort("live");
  }

  const hasFilters =
    Boolean(owner) ||
    Boolean(marketplace) ||
    Boolean(status) ||
    Boolean(category) ||
    riskFilter !== "all" ||
    Boolean(query) ||
    mpHealth !== "all";

  return (
    <div className="flex w-full min-h-full flex-col gap-10 rounded-2xl border border-border bg-surface p-6">
      {/* Overview */}
      <section id="overview" className="scroll-mt-4 flex flex-col gap-6">
        <PageHeader
          title="Executive overview"
          subtitle="Marketplace portfolio health, deployment status, and adoption across AWS, Azure, GCP, Databricks, and Anthropic."
          actions={
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                document.getElementById("report")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <Download className="size-4" />
              Status report
            </button>
          }
        />
        <KpiStrip kpis={kpis} onAction={applyKpiAction} />
      </section>

      {/* Marketplaces */}
      <section id="marketplaces" className="scroll-mt-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="type-heading">Marketplaces</h2>
            <p className="type-subtitle mt-1">
              Click a card to filter the product catalog by that marketplace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex flex-col gap-1">
              <span className="type-label">Health</span>
              <select
                className={cn(selectClass, "w-[140px]")}
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
                className={cn(selectClass, "w-[140px]")}
                value={mpSort}
                onChange={(e) =>
                  setMpSort(e.target.value as typeof mpSort)
                }
              >
                <option value="live">Live count</option>
                <option value="mau">MAU</option>
                <option value="review">In review</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {filteredMarketplaces.map((s) => (
            <MarketplaceCard
              key={s.marketplace.id}
              summary={s}
              onSelect={(id) => setMarketplace(id)}
            />
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="scroll-mt-4 flex flex-col gap-4">
        <div>
          <h2 className="type-heading">Products</h2>
          <p className="type-subtitle mt-1">
            Filter, search, and sort the product portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <label className="flex flex-col gap-1.5 xl:col-span-2">
            <span className="type-label">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 size-4 text-zinc-400" />
              <input
                className={cn(selectClass, "pl-9")}
                placeholder="Name, owner, category…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                suppressHydrationWarning
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="type-label">Owner</span>
            <select
              className={selectClass}
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            >
              <option value="">All</option>
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="type-label">Marketplace</span>
            <select
              className={selectClass}
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value)}
            >
              <option value="">All</option>
              {marketplaces.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="type-label">Status</span>
            <select
              className={selectClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              {[
                "not_started",
                "draft",
                "in_review",
                "listed",
                "deployed",
                "degraded",
                "failed",
              ].map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="type-label">Category</span>
            <select
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="type-label">Risk</span>
            <select
              className={selectClass}
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
            >
              <option value="all">All</option>
              <option value="flagged">Flagged</option>
              <option value="clear">Clear</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="type-label">Sort</span>
            <select
              className={selectClass}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="mau-desc">MAU ↓</option>
              <option value="mau-asc">MAU ↑</option>
              <option value="spend-desc">Spend ↓</option>
              <option value="spend-asc">Spend ↑</option>
              <option value="success-desc">Success ↓</option>
              <option value="success-asc">Success ↑</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="updated-desc">Recently updated</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="type-caption">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="btn-secondary h-9 gap-1.5 border-dashed bg-zinc-50/50 text-xs"
            >
              <FilterX className="size-3.5" />
              Clear all filters
            </button>
          ) : null}
        </div>

        <ProductTable rows={filteredProducts} />
      </section>

      <ProgressUpdatesSection
        initialUpdates={progressUpdates}
        initialDailyEntries={dailyProgressEntries}
        products={productOptions}
        marketplaces={marketplaces}
      />

      {/* Matrix */}
      <section id="matrix" className="scroll-mt-4 flex flex-col gap-4">
        <div>
          <h2 className="type-heading">Deployment matrix</h2>
          <p className="type-subtitle mt-1">
            Product × marketplace listing status. Hover a cell for blockers and dates.
          </p>
        </div>
        <DeploymentMatrix />
      </section>

      {/* Risks */}
      <section id="risks" className="scroll-mt-4 flex flex-col gap-4">
        <div>
          <h2 className="type-heading">Risks & blockers</h2>
          <p className="type-subtitle mt-1">
            Open P0–P2 items with owners and related products.
          </p>
        </div>
        <div className="panel-pad">
          <RiskList risks={filteredRisks} />
        </div>
      </section>

      {/* Report */}
      <section id="report" className="scroll-mt-4 flex flex-col gap-6">
        <PageHeader
          title="Status report"
          subtitle={`Print-ready snapshot · ${formatDate(generatedAt)}`}
          actions={
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.print()}
            >
              <Download className="size-4" />
              Print / PDF
            </button>
          }
        />

        <div className="print-break flex flex-col gap-4">
          <h3 className="type-heading">Marketplace summary</h3>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="min-w-full text-left">
              <thead className="border-b border-border bg-zinc-50/80">
                <tr>
                  {[
                    "Marketplace",
                    "Live",
                    "In review",
                    "Draft",
                    "MAU",
                    "Health",
                    "Last change",
                  ].map((h) => (
                    <th key={h} className="type-label px-6 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summaries.map((s) => (
                  <tr key={s.marketplace.id} className="hover:bg-zinc-50/50">
                    <td className="type-body px-6 py-3.5 font-semibold">
                      {s.marketplace.name}
                    </td>
                    <td className="type-body px-6 py-3.5 tabular-nums">
                      {s.liveCount}
                    </td>
                    <td className="type-body px-6 py-3.5 tabular-nums">
                      {s.inReviewCount}
                    </td>
                    <td className="type-body px-6 py-3.5 tabular-nums">
                      {s.draftCount}
                    </td>
                    <td className="type-body px-6 py-3.5 tabular-nums">
                      {formatNumber(s.mauProxy)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={cn(
                          "type-caption inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 font-semibold",
                          s.health === "healthy" &&
                            "bg-success-soft text-success",
                          s.health === "watch" &&
                            "bg-warning-soft text-warning",
                          s.health === "at_risk" && "bg-error-soft text-error",
                        )}
                      >
                        {s.health === "at_risk"
                          ? "At risk"
                          : s.health === "watch"
                            ? "Watch"
                            : "Healthy"}
                      </span>
                    </td>
                    <td className="type-body px-6 py-3.5">
                      {formatDate(s.lastChange)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="print-break flex flex-col gap-4">
          <h3 className="type-heading">Full product portfolio</h3>
          <ProductTable rows={products} />
        </div>
      </section>
    </div>
  );
}
