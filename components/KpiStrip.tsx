"use client";

import {
  Activity,
  AlertTriangle,
  CircleDollarSign,
  ClipboardList,
  HeartPulse,
  PackageCheck,
  Users,
} from "lucide-react";
import type { ExecutiveKpis } from "@/lib/data";
import { formatNumber, formatPct, formatUsd } from "@/lib/status";
import { cn } from "@/lib/utils";
import { scrollToSection, type SectionId } from "@/components/Sidebar";

export type KpiAction =
  | { type: "filter-status"; status: string }
  | { type: "sort"; sort: string }
  | { type: "navigate"; section: SectionId };

const items: {
  key: keyof ExecutiveKpis;
  label: string;
  format: (v: number) => string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "neutral" | "success" | "warning" | "error";
  target: SectionId;
  hint: string;
}[] = [
  {
    key: "productsLive",
    label: "Products live",
    format: formatNumber,
    icon: PackageCheck,
    tone: "success",
    target: "products",
    hint: "View live products",
  },
  {
    key: "listingsInReview",
    label: "In review",
    format: formatNumber,
    icon: ClipboardList,
    tone: "warning",
    target: "products",
    hint: "Filter in-review listings",
  },
  {
    key: "listingsBlocked",
    label: "Blocked / watch",
    format: formatNumber,
    icon: AlertTriangle,
    tone: "warning",
    target: "risks",
    hint: "Jump to risks",
  },
  {
    key: "totalMau",
    label: "Total MAU",
    format: formatNumber,
    icon: Users,
    tone: "neutral",
    target: "products",
    hint: "Sort products by MAU",
  },
  {
    key: "deploymentHealth",
    label: "Deploy health",
    format: (v) => formatPct(v, 1),
    icon: HeartPulse,
    tone: "success",
    target: "matrix",
    hint: "Open deployment matrix",
  },
  {
    key: "spendMtd",
    label: "Spend MTD",
    format: formatUsd,
    icon: CircleDollarSign,
    tone: "neutral",
    target: "products",
    hint: "Sort by spend",
  },
  {
    key: "openCriticalRisks",
    label: "Open P0/P1",
    format: formatNumber,
    icon: Activity,
    tone: "error",
    target: "risks",
    hint: "View critical risks",
  },
];

const gradients: Record<string, string> = {
  neutral: "linear-gradient(to top, #18181B, #71717A)",
  success: "linear-gradient(to top, #059669, #34D399)",
  warning: "linear-gradient(to top, #D97706, #FBBF24)",
  error: "linear-gradient(to top, #DC2626, #F87171)",
};

export function KpiStrip({
  kpis,
  onAction,
}: {
  kpis: ExecutiveKpis;
  onAction?: (key: keyof ExecutiveKpis, action: KpiAction) => void;
}) {
  function handleClick(key: keyof ExecutiveKpis, target: SectionId) {
    const actionMap: Partial<Record<keyof ExecutiveKpis, KpiAction>> = {
      productsLive: { type: "filter-status", status: "deployed" },
      listingsInReview: { type: "filter-status", status: "in_review" },
      listingsBlocked: { type: "navigate", section: "risks" },
      totalMau: { type: "sort", sort: "mau-desc" },
      deploymentHealth: { type: "navigate", section: "matrix" },
      spendMtd: { type: "sort", sort: "spend-desc" },
      openCriticalRisks: { type: "navigate", section: "risks" },
    };
    const action = actionMap[key] ?? { type: "navigate", section: target };
    onAction?.(key, action);
    scrollToSection(action.type === "navigate" ? action.section : target);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            title={item.hint}
            onClick={() => handleClick(item.key, item.target)}
            className={cn(
              "flex min-h-[140px] cursor-pointer select-none flex-col justify-between rounded-xl border border-border bg-surface p-5 text-left transition-all duration-150 hover:border-border-strong hover:shadow-sm active:scale-[0.98]",
            )}
          >
            <div className="flex flex-col gap-6">
              <div
                className="flex size-12 items-center justify-center rounded-lg text-white shadow-[0_0_0_1px_rgba(39,39,42,0.5)]"
                style={{ background: gradients[item.tone] }}
              >
                <Icon className="size-[30px]" />
              </div>
              <p className="type-metric tabular-nums">
                {item.format(kpis[item.key])}
              </p>
            </div>
            <p className="type-caption mt-2">{item.label}</p>
          </button>
        );
      })}
    </div>
  );
}
