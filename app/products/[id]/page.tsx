import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { StatusBadge } from "@/components/StatusBadge";
import { TrendChart } from "@/components/TrendChart";
import {
  getCostsForProduct,
  getDeployments,
  getListings,
  getMarketplaceById,
  getProductById,
  getRisks,
  getUsageForProduct,
} from "@/lib/data";
import { formatDate, formatNumber, formatPct, formatUsd } from "@/lib/status";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const productListings = getListings({ productId: id });
  const productDeployments = getDeployments({ productId: id });
  const usage = getUsageForProduct(id);
  const costs = getCostsForProduct(id);
  const productRisks = getRisks({ openOnly: true }).filter(
    (r) => r.relatedProductId === id,
  );

  const usageTrend = usage.map((u) => ({
    date: u.date,
    dau: u.dau,
    wau: u.wau,
    mau: u.mau,
  }));

  const costByDate = new Map<string, number>();
  for (const c of costs) {
    costByDate.set(c.date, (costByDate.get(c.date) ?? 0) + c.amountUsd);
  }
  const spendTrend = [...costByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amountUsd]) => ({ date, amountUsd }));

  const latestUsage = usage[usage.length - 1];
  const latestDailySpend = spendTrend[spendTrend.length - 1]?.amountUsd ?? 0;

  return (
    <PageShell>
      <div>
        <Link
          href="/products"
          className="type-body mb-3 inline-flex items-center gap-1.5 font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <PageHeader
          title={product.name}
          subtitle={product.description}
          actions={
            <div className="text-right">
              <p className="type-caption font-mono">v{product.version}</p>
              <p className="type-caption">Owner: {product.owner}</p>
              <p className="type-caption">
                Updated {formatDate(product.lastUpdated)}
              </p>
            </div>
          }
        />
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="MAU" value={formatNumber(latestUsage?.mau ?? 0)} />
        <StatTile label="DAU" value={formatNumber(latestUsage?.dau ?? 0)} />
        <StatTile
          label="Active tenants"
          value={formatNumber(latestUsage?.activeTenants ?? 0)}
        />
        <StatTile label="Est. daily spend" value={formatUsd(latestDailySpend)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel-pad">
          <h2 className="type-heading mb-4">Catalog</h2>
          <dl className="space-y-3">
            <MetaRow label="Purpose" value={product.purpose} />
            <MetaRow label="Category" value={product.category} />
            <MetaRow
              label="Dependencies"
              value={product.dependencies.join(", ") || "—"}
            />
          </dl>
        </div>
        <div className="panel-pad">
          <h2 className="type-heading mb-4">Open risks</h2>
          {productRisks.length === 0 ? (
            <p className="type-caption">No open risks for this product.</p>
          ) : (
            <ul className="space-y-2">
              {productRisks.map((r) => (
                <li key={r.id} className="type-body">
                  <span className="font-semibold text-error">{r.severity}</span>{" "}
                  {r.title}
                  <p className="type-caption mt-0.5">{r.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="type-heading">Listing timeline</h2>
        <DataTable
          headers={["Marketplace", "Status", "Submitted", "Listed", "Blockers"]}
          rows={productListings.map((l) => {
            const mp = getMarketplaceById(l.marketplaceId);
            return [
              mp?.name ?? l.marketplaceId,
              <StatusBadge key="st" status={l.status} />,
              formatDate(l.submittedAt),
              formatDate(l.listedAt),
              <span key="b" className="type-caption">
                {l.blockers.length ? l.blockers.join("; ") : "—"}
              </span>,
            ];
          })}
          empty="No marketplace listings for this product."
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="type-heading">Environments</h2>
        <DataTable
          headers={[
            "Marketplace",
            "Env",
            "Status",
            "Success",
            "Error",
            "Escalation",
            "Uptime",
            "Last deploy",
            "Rollbacks",
          ]}
          rows={productDeployments.map((d) => [
            getMarketplaceById(d.marketplaceId)?.cloud ?? d.marketplaceId,
            <span key="e" className="capitalize">
              {d.env}
            </span>,
            <StatusBadge key="s" status={d.status} />,
            formatPct(d.successRate, 1),
            formatPct(d.errorRate, 1),
            formatPct(d.escalationRate, 1),
            `${d.uptimePct.toFixed(1)}%`,
            formatDate(d.lastDeployAt),
            String(d.rollbackCount),
          ])}
          empty="No deployments recorded yet."
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel-pad">
          <h2 className="type-heading mb-4">Adoption trend</h2>
          <TrendChart
            data={usageTrend}
            series={[
              { key: "mau", label: "MAU" },
              { key: "wau", label: "WAU" },
              { key: "dau", label: "DAU" },
            ]}
            format="number"
          />
        </div>
        <div className="panel-pad">
          <h2 className="type-heading mb-4">Spend trend (daily)</h2>
          <TrendChart
            data={spendTrend}
            series={[{ key: "amountUsd", label: "USD" }]}
            format="usd"
          />
        </div>
      </section>
    </PageShell>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="type-caption">{label}</p>
      <p className="type-metric mt-2 tabular-nums">{value}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="type-caption">{label}</dt>
      <dd className="type-body mt-0.5">{value}</dd>
    </div>
  );
}

function DataTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="min-w-full text-left">
        <thead className="border-b border-border bg-zinc-50/80">
          <tr>
            {headers.map((h) => (
              <th key={h} className="type-label px-6 py-3.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="type-caption px-6 py-12 text-center"
              >
                {empty ?? "No data."}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-50/50">
                {row.map((cell, j) => (
                  <td key={j} className="type-body px-6 py-3.5 tabular-nums">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
