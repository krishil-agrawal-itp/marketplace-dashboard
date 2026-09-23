import {
  costSnapshots,
  dailyProgressEntries,
  deployments,
  listings,
  marketplaces,
  products,
  progressUpdates,
  risks,
  usageSnapshots,
} from "@/data/seed";
import { isBlockedStatus, isLiveStatus } from "@/lib/status";
import type {
  CostSnapshot,
  DailyProgressEntry,
  Deployment,
  Listing,
  Marketplace,
  Product,
  ProgressUpdate,
  Risk,
  Status,
  UsageSnapshot,
} from "@/lib/types";

export function getMarketplaces(): Marketplace[] {
  return marketplaces;
}

export function getMarketplaceBySlug(slug: string): Marketplace | undefined {
  return marketplaces.find((m) => m.slug === slug);
}

export function getMarketplaceById(id: string): Marketplace | undefined {
  return marketplaces.find((m) => m.id === id);
}

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getListings(filters?: {
  marketplaceId?: string;
  productId?: string;
  status?: Status;
}): Listing[] {
  return listings.filter((l) => {
    if (filters?.marketplaceId && l.marketplaceId !== filters.marketplaceId) return false;
    if (filters?.productId && l.productId !== filters.productId) return false;
    if (filters?.status && l.status !== filters.status) return false;
    return true;
  });
}

export function getDeployments(filters?: {
  marketplaceId?: string;
  productId?: string;
}): Deployment[] {
  return deployments.filter((d) => {
    if (filters?.marketplaceId && d.marketplaceId !== filters.marketplaceId) return false;
    if (filters?.productId && d.productId !== filters.productId) return false;
    return true;
  });
}

export function getUsageForProduct(productId: string): UsageSnapshot[] {
  return usageSnapshots
    .filter((u) => u.productId === productId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getLatestUsage(productId: string): UsageSnapshot | undefined {
  const rows = getUsageForProduct(productId);
  return rows[rows.length - 1];
}

export function getCostsForProduct(productId: string): CostSnapshot[] {
  return costSnapshots
    .filter((c) => c.productId === productId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getRisks(filters?: { openOnly?: boolean }): Risk[] {
  const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return risks
    .filter((r) => (filters?.openOnly ? r.status !== "resolved" : true))
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

export function getMatrixCell(productId: string, marketplaceId: string): Listing | undefined {
  return listings.find(
    (l) => l.productId === productId && l.marketplaceId === marketplaceId,
  );
}

export interface ExecutiveKpis {
  productsLive: number;
  listingsInReview: number;
  listingsBlocked: number;
  totalMau: number;
  deploymentHealth: number;
  spendMtd: number;
  openCriticalRisks: number;
}

export function getExecutiveKpis(): ExecutiveKpis {
  const liveProductIds = new Set(
    listings.filter((l) => isLiveStatus(l.status)).map((l) => l.productId),
  );

  const inReview = listings.filter((l) => l.status === "in_review").length;
  const blocked = listings.filter(
    (l) => isBlockedStatus(l.status) || l.blockers.length > 0,
  ).length;

  const latestByProduct = new Map<string, UsageSnapshot>();
  for (const u of usageSnapshots) {
    const prev = latestByProduct.get(u.productId);
    if (!prev || u.date > prev.date) latestByProduct.set(u.productId, u);
  }
  const totalMau = [...latestByProduct.values()].reduce((sum, u) => sum + u.mau, 0);

  const prodDeploys = deployments.filter((d) => d.env === "prod");
  const deploymentHealth =
    prodDeploys.length === 0
      ? 0
      : prodDeploys.reduce((sum, d) => sum + d.successRate, 0) / prodDeploys.length;

  // Approximate MTD as sum of last 7 days of cost snapshots / 7 * days-in-month proxy:
  // For demo, sum unique product-day amounts for the latest date per product+marketplace, then * scale.
  const latestCostKeys = new Map<string, CostSnapshot>();
  for (const c of costSnapshots) {
    const key = `${c.productId}:${c.marketplaceId ?? "none"}`;
    const prev = latestCostKeys.get(key);
    if (!prev || c.date > prev.date) latestCostKeys.set(key, c);
  }
  const dailyBurn = [...latestCostKeys.values()].reduce((sum, c) => sum + c.amountUsd, 0);
  const spendMtd = dailyBurn * 22; // business-day MTD proxy for seed demo

  const openCriticalRisks = risks.filter(
    (r) => r.status !== "resolved" && (r.severity === "P0" || r.severity === "P1"),
  ).length;

  return {
    productsLive: liveProductIds.size,
    listingsInReview: inReview,
    listingsBlocked: blocked,
    totalMau,
    deploymentHealth,
    spendMtd,
    openCriticalRisks,
  };
}

export interface MarketplaceSummary {
  marketplace: Marketplace;
  liveCount: number;
  inReviewCount: number;
  draftCount: number;
  mauProxy: number;
  lastChange: string | null;
  health: "healthy" | "watch" | "at_risk";
}

export function getMarketplaceSummaries(): MarketplaceSummary[] {
  return marketplaces.map((marketplace) => {
    const mpListings = listings.filter((l) => l.marketplaceId === marketplace.id);
    const liveCount = mpListings.filter((l) => isLiveStatus(l.status)).length;
    const inReviewCount = mpListings.filter((l) => l.status === "in_review").length;
    const draftCount = mpListings.filter((l) => l.status === "draft").length;

    const liveProductIds = mpListings
      .filter((l) => isLiveStatus(l.status))
      .map((l) => l.productId);
    const mauProxy = liveProductIds.reduce((sum, pid) => {
      const u = getLatestUsage(pid);
      return sum + (u?.mau ?? 0);
    }, 0);

    const dates = mpListings
      .flatMap((l) => [l.listedAt, l.submittedAt])
      .filter((d): d is string => Boolean(d))
      .sort();
    const lastChange = dates[dates.length - 1] ?? null;

    const degraded = mpListings.some(
      (l) => l.status === "degraded" || l.status === "failed" || l.blockers.length > 0,
    );
    const health: MarketplaceSummary["health"] = degraded
      ? "at_risk"
      : inReviewCount > 0
        ? "watch"
        : "healthy";

    return {
      marketplace,
      liveCount,
      inReviewCount,
      draftCount,
      mauProxy,
      lastChange,
      health,
    };
  });
}

export interface ProductRow {
  product: Product;
  liveMarketplaces: string[];
  marketplaceIds: string[];
  bestStatus: Status;
  successRate: number | null;
  mau: number;
  spendMtd: number;
  hasRisk: boolean;
}

function rankStatus(status: Status): number {
  const order: Status[] = [
    "failed",
    "degraded",
    "deployed",
    "listed",
    "in_review",
    "draft",
    "not_started",
    "deprecated",
  ];
  return order.indexOf(status);
}

export function getProductRows(filters?: {
  marketplaceId?: string;
  owner?: string;
  status?: Status;
}): ProductRow[] {
  return products
    .filter((p) => (filters?.owner ? p.owner === filters.owner : true))
    .map((product) => {
      let productListings = listings.filter((l) => l.productId === product.id);
      if (filters?.marketplaceId) {
        productListings = productListings.filter(
          (l) => l.marketplaceId === filters.marketplaceId,
        );
      }

      const allProductListings = listings.filter((l) => l.productId === product.id);
      const liveMarketplaces = productListings
        .filter((l) => isLiveStatus(l.status))
        .map((l) => getMarketplaceById(l.marketplaceId)?.name ?? l.marketplaceId);
      const marketplaceIds = [
        ...new Set(allProductListings.map((l) => l.marketplaceId)),
      ];

      const bestStatus =
        productListings.length === 0
          ? ("not_started" as Status)
          : [...productListings].sort((a, b) => rankStatus(a.status) - rankStatus(b.status))[0]
              .status;

      const prodDeploys = deployments.filter(
        (d) =>
          d.productId === product.id &&
          d.env === "prod" &&
          (!filters?.marketplaceId || d.marketplaceId === filters.marketplaceId),
      );
      const successRate =
        prodDeploys.length === 0
          ? null
          : prodDeploys.reduce((s, d) => s + d.successRate, 0) / prodDeploys.length;

      const mau = getLatestUsage(product.id)?.mau ?? 0;

      const latestCosts = new Map<string, CostSnapshot>();
      for (const c of costSnapshots.filter((x) => x.productId === product.id)) {
        const key = c.marketplaceId ?? "none";
        const prev = latestCosts.get(key);
        if (!prev || c.date > prev.date) latestCosts.set(key, c);
      }
      const spendMtd =
        [...latestCosts.values()].reduce((s, c) => s + c.amountUsd, 0) * 22;

      const hasRisk = risks.some(
        (r) =>
          r.relatedProductId === product.id &&
          r.status !== "resolved" &&
          (r.severity === "P0" || r.severity === "P1"),
      );

      return {
        product,
        liveMarketplaces,
        marketplaceIds,
        bestStatus,
        successRate,
        mau,
        spendMtd,
        hasRisk,
      };
    })
    .filter((row) => (filters?.status ? row.bestStatus === filters.status : true));
}

export function getOwners(): string[] {
  return [...new Set(products.map((p) => p.owner))].sort();
}

export function getProgressUpdates(): ProgressUpdate[] {
  const rank: Record<ProgressUpdate["status"], number> = {
    blocked: 0,
    at_risk: 1,
    delayed: 2,
    on_track: 3,
    completed: 4,
  };
  return [...progressUpdates].sort((a, b) => {
    const byStatus = rank[a.status] - rank[b.status];
    if (byStatus !== 0) return byStatus;
    return a.eta.localeCompare(b.eta);
  });
}

export function getDailyProgressEntries(
  progressUpdateId?: string,
): DailyProgressEntry[] {
  const rows = progressUpdateId
    ? dailyProgressEntries.filter((d) => d.progressUpdateId === progressUpdateId)
    : dailyProgressEntries;
  return [...rows].sort((a, b) => b.date.localeCompare(a.date));
}
