export type Status =
  | "not_started"
  | "draft"
  | "in_review"
  | "listed"
  | "deployed"
  | "degraded"
  | "failed"
  | "deprecated";

export type Env = "prod" | "staging" | "sandbox";

export type RiskSeverity = "P0" | "P1" | "P2" | "P3";

export type RiskStatus = "open" | "mitigating" | "resolved";

export interface Marketplace {
  id: string;
  name: string;
  slug: string;
  cloud: string;
  icon: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  owner: string;
  category: string;
  description: string;
  version: string;
  purpose: string;
  dependencies: string[];
  lastUpdated: string;
}

export interface Listing {
  id: string;
  productId: string;
  marketplaceId: string;
  status: Status;
  submittedAt: string | null;
  listedAt: string | null;
  listingUrl: string | null;
  blockers: string[];
}

export interface Deployment {
  id: string;
  productId: string;
  marketplaceId: string;
  env: Env;
  status: Status;
  successRate: number;
  errorRate: number;
  escalationRate: number;
  lastDeployAt: string | null;
  rollbackCount: number;
  uptimePct: number;
}

export interface UsageSnapshot {
  id: string;
  productId: string;
  date: string;
  dau: number;
  wau: number;
  mau: number;
  installs: number;
  activeTenants: number;
  tasksExecuted: number;
}

export interface CostSnapshot {
  id: string;
  productId: string;
  marketplaceId: string | null;
  date: string;
  amountUsd: number;
  costPerSuccess: number;
}

export interface Risk {
  id: string;
  severity: RiskSeverity;
  title: string;
  owner: string;
  relatedProductId: string | null;
  relatedMarketplaceId: string | null;
  status: RiskStatus;
  detail: string;
}

export type ProgressStatus =
  | "on_track"
  | "at_risk"
  | "blocked"
  | "delayed"
  | "completed";

export interface ProgressUpdate {
  id: string;
  title: string;
  productId: string | null;
  marketplaceId: string | null;
  owner: string;
  team: string;
  progressPct: number;
  status: ProgressStatus;
  eta: string;
  lastUpdateAt: string;
  updateNotes: string;
  wip: string;
  nextMilestone: string;
  blockers: string;
}

export interface DailyProgressEntry {
  id: string;
  progressUpdateId: string;
  date: string;
  author: string;
  notes: string;
  progressPct: number;
  hoursSpent: number | null;
  accomplishments: string;
  tomorrowPlan: string;
}
