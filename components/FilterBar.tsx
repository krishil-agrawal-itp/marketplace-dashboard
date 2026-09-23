"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilterX } from "lucide-react";

export function FilterBar({
  owners,
  marketplaces,
  selectedOwner,
  selectedMarketplace,
  selectedStatus,
  basePath,
}: {
  owners: string[];
  marketplaces: { id: string; name: string }[];
  selectedOwner?: string;
  selectedMarketplace?: string;
  selectedStatus?: string;
  basePath: string;
}) {
  const router = useRouter();
  const statuses = [
    "not_started",
    "draft",
    "in_review",
    "listed",
    "deployed",
    "degraded",
    "failed",
  ];

  function navigate(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const next = {
      owner: selectedOwner,
      marketplace: selectedMarketplace,
      status: selectedStatus,
      ...overrides,
    };
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const selectClass =
    "h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:border-border-strong focus:outline-none";

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="flex flex-col gap-1.5">
        <span className="type-label">Owner</span>
        <select
          className={selectClass}
          value={selectedOwner ?? ""}
          onChange={(e) => navigate({ owner: e.target.value || undefined })}
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
          value={selectedMarketplace ?? ""}
          onChange={(e) =>
            navigate({ marketplace: e.target.value || undefined })
          }
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
          value={selectedStatus ?? ""}
          onChange={(e) => navigate({ status: e.target.value || undefined })}
        >
          <option value="">All</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end sm:col-span-2 lg:col-span-2">
        <Link
          href={basePath}
          className="btn-secondary h-10 gap-1.5 border-dashed bg-zinc-50/50 text-xs"
        >
          <FilterX className="size-3.5" />
          Clear filters
        </Link>
      </div>
    </div>
  );
}
