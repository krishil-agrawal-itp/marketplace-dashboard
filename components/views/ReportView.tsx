"use client";

import { Download } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { ProductTable } from "@/components/ProductTable";
import type { MarketplaceSummary, ProductRow } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/status";
import { cn } from "@/lib/utils";

export function ReportView({
  summaries,
  products,
  generatedAt,
}: {
  summaries: MarketplaceSummary[];
  products: ProductRow[];
  generatedAt: string;
}) {
  return (
    <PageShell>
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

      <section className="print-break flex flex-col gap-4">
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
                        s.health === "healthy" && "bg-success-soft text-success",
                        s.health === "watch" && "bg-warning-soft text-warning",
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
      </section>

      <section className="print-break flex flex-col gap-4">
        <h3 className="type-heading">Full product portfolio</h3>
        <ProductTable rows={products} />
      </section>
    </PageShell>
  );
}
