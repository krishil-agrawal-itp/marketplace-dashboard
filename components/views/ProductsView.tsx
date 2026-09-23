"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterX, Search } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { ProductTable } from "@/components/ProductTable";
import type { ProductRow } from "@/lib/data";
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

const selectClass =
  "h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:border-border-strong focus:outline-none";

export function ProductsView({
  products,
  owners,
  categories,
  marketplaces,
  initialOwner = "",
  initialMarketplace = "",
  initialStatus = "",
  initialCategory = "",
  initialRisk = "all",
  initialSort = "mau-desc",
  initialQuery = "",
}: {
  products: ProductRow[];
  owners: string[];
  categories: string[];
  marketplaces: { id: string; name: string }[];
  initialOwner?: string;
  initialMarketplace?: string;
  initialStatus?: string;
  initialCategory?: string;
  initialRisk?: RiskFilter;
  initialSort?: SortKey;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [owner, setOwner] = useState(initialOwner);
  const [marketplace, setMarketplace] = useState(initialMarketplace);
  const [status, setStatus] = useState(initialStatus);
  const [category, setCategory] = useState(initialCategory);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>(initialRisk);
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [query, setQuery] = useState(initialQuery);

  function syncUrl(next: {
    owner?: string;
    marketplace?: string;
    status?: string;
    category?: string;
    risk?: string;
    sort?: string;
    q?: string;
  }) {
    const params = new URLSearchParams();
    const values = {
      owner: next.owner ?? owner,
      marketplace: next.marketplace ?? marketplace,
      status: next.status ?? status,
      category: next.category ?? category,
      risk: next.risk ?? riskFilter,
      sort: next.sort ?? sort,
      q: next.q ?? query,
    };
    Object.entries(values).forEach(([k, v]) => {
      if (!v || v === "all" || (k === "sort" && v === "mau-desc")) return;
      params.set(k, v);
    });
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products");
  }

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

  function clearFilters() {
    setOwner("");
    setMarketplace("");
    setStatus("");
    setCategory("");
    setRiskFilter("all");
    setSort("mau-desc");
    setQuery("");
    router.replace("/products");
  }

  const hasFilters =
    Boolean(owner) ||
    Boolean(marketplace) ||
    Boolean(status) ||
    Boolean(category) ||
    riskFilter !== "all" ||
    Boolean(query) ||
    sort !== "mau-desc";

  return (
    <PageShell>
      <PageHeader
        title="Products"
        subtitle="Filter, search, and sort the product portfolio. Click a row for details."
      />

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <label className="flex flex-col gap-1.5 xl:col-span-2">
          <span className="type-label">Search</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-zinc-400" />
            <input
              className={cn(selectClass, "pl-9")}
              placeholder="Name, owner, category…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                syncUrl({ q: e.target.value });
              }}
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
            onChange={(e) => {
              setOwner(e.target.value);
              syncUrl({ owner: e.target.value });
            }}
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
            onChange={(e) => {
              setMarketplace(e.target.value);
              syncUrl({ marketplace: e.target.value });
            }}
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
            onChange={(e) => {
              setStatus(e.target.value);
              syncUrl({ status: e.target.value });
            }}
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
            onChange={(e) => {
              setCategory(e.target.value);
              syncUrl({ category: e.target.value });
            }}
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
            onChange={(e) => {
              const value = e.target.value as RiskFilter;
              setRiskFilter(value);
              syncUrl({ risk: value });
            }}
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
            onChange={(e) => {
              const value = e.target.value as SortKey;
              setSort(value);
              syncUrl({ sort: value });
            }}
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
    </PageShell>
  );
}
