import type { Status } from "./types";

export const STATUS_LABELS: Record<Status, string> = {
  not_started: "Not started",
  draft: "Draft",
  in_review: "In review",
  listed: "Listed",
  deployed: "Deployed",
  degraded: "Degraded",
  failed: "Failed",
  deprecated: "Deprecated",
};

export const STATUS_ORDER: Status[] = [
  "not_started",
  "draft",
  "in_review",
  "listed",
  "deployed",
  "degraded",
  "failed",
  "deprecated",
];

/** Status tone map aligned to HRMS DESIGN.md badge variants */
export function statusBadgeClass(status: Status): string {
  switch (status) {
    case "deployed":
    case "listed":
      return "bg-success-soft text-success";
    case "in_review":
    case "draft":
    case "degraded":
      return "bg-warning-soft text-warning";
    case "failed":
      return "bg-error-soft text-error";
    case "deprecated":
    case "not_started":
    default:
      return "bg-surface-secondary text-text-secondary";
  }
}

export function isLiveStatus(status: Status): boolean {
  return status === "deployed" || status === "listed";
}

export function isBlockedStatus(status: Status): boolean {
  return status === "in_review" || status === "failed" || status === "degraded";
}

export function formatPct(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
