"use client";

import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { KpiStrip } from "@/components/KpiStrip";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { PageHeader, PageShell } from "@/components/PageShell";
import { ProductTable } from "@/components/ProductTable";
import { RiskList } from "@/components/RiskList";
import type {
  ExecutiveKpis,
  MarketplaceSummary,
  ProductRow,
} from "@/lib/data";
import type { Risk } from "@/lib/types";

export function OverviewView({
  kpis,
  summaries,
  topProducts,
  risks,
}: {
  kpis: ExecutiveKpis;
  summaries: MarketplaceSummary[];
  topProducts: ProductRow[];
  risks: Risk[];
}) {
  return (
    <PageShell>
      <PageHeader
        title="Executive overview"
        subtitle="Marketplace portfolio health, deployment status, and adoption across AWS, Azure, GCP, Databricks, and Anthropic."
        actions={
          <Link href="/reports" className="btn-primary">
            <FileText className="size-4" />
            Status report
          </Link>
        }
      />

      <KpiStrip kpis={kpis} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="type-heading">Marketplaces</h2>
          <Link
            href="/marketplaces"
            className="type-body font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {summaries.map((s) => (
            <MarketplaceCard key={s.marketplace.id} summary={s} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="type-heading">Top products</h2>
            <Link
              href="/products"
              className="type-body font-semibold hover:underline"
            >
              All products →
            </Link>
          </div>
          <ProductTable rows={topProducts} />
        </div>
        <div className="panel-pad col-span-12 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="type-heading">Top risks</h2>
            <Link
              href="/risks"
              className="type-body font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>
          <RiskList risks={risks} />
        </div>
      </section>

      <div className="flex justify-end">
        <Link href="/reports" className="btn-secondary">
          <Download className="size-4" />
          Open printable report
        </Link>
      </div>
    </PageShell>
  );
}
