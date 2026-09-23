"use client";

import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import type { ProductRow } from "@/lib/data";
import { formatNumber, formatPct, formatUsd } from "@/lib/status";

export function ProductTable({ rows }: { rows: ProductRow[] }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="min-w-full text-left">
        <thead className="border-b border-border bg-zinc-50/80">
          <tr>
            {[
              "Product",
              "Owner",
              "Live on",
              "Status",
              "Success %",
              "MAU",
              "Spend MTD",
              "Version",
              "Risk",
            ].map((h) => (
              <th key={h} className="type-label px-6 py-3.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="type-caption px-6 py-12 text-center">
                No products found.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.product.id}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/products/${row.product.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/products/${row.product.id}`);
                  }
                }}
                className="cursor-pointer transition-colors duration-150 hover:bg-zinc-50/50"
              >
                <td className="px-6 py-3.5">
                  <p className="type-body font-semibold text-text-primary">
                    {row.product.name}
                  </p>
                  <p className="type-caption">{row.product.category}</p>
                </td>
                <td className="type-body px-6 py-3.5">{row.product.owner}</td>
                <td className="type-caption px-6 py-3.5">
                  {row.liveMarketplaces.length
                    ? row.liveMarketplaces.join(", ")
                    : "—"}
                </td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={row.bestStatus} />
                </td>
                <td className="type-body px-6 py-3.5 tabular-nums">
                  {row.successRate == null ? "—" : formatPct(row.successRate, 1)}
                </td>
                <td className="type-body px-6 py-3.5 tabular-nums">
                  {formatNumber(row.mau)}
                </td>
                <td className="type-body px-6 py-3.5 tabular-nums">
                  {formatUsd(row.spendMtd)}
                </td>
                <td className="type-caption px-6 py-3.5 font-mono">
                  {row.product.version}
                </td>
                <td className="px-6 py-3.5">
                  {row.hasRisk ? (
                    <span className="type-caption font-semibold text-error">
                      Flagged
                    </span>
                  ) : (
                    <span className="type-caption">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
