import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getMarketplaces,
  getMatrixCell,
  getProducts,
} from "@/lib/data";
import type { Status } from "@/lib/types";

const STATUS_TIP: Record<Status, string> = {
  not_started: "Not started",
  draft: "Draft",
  in_review: "In review",
  listed: "Listed",
  deployed: "Deployed",
  degraded: "Degraded",
  failed: "Failed",
  deprecated: "Deprecated",
};

export function DeploymentMatrix() {
  const products = getProducts();
  const marketplaces = getMarketplaces();

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="min-w-full text-left">
        <thead className="border-b border-border bg-zinc-50/80">
          <tr>
            <th className="type-label sticky left-0 z-10 bg-zinc-50/95 px-6 py-3.5 backdrop-blur">
              Product
            </th>
            {marketplaces.map((m) => (
              <th key={m.id} className="type-label px-4 py-3.5">
                <Link
                  href={`/marketplaces/${m.slug}`}
                  className="hover:text-text-primary hover:underline"
                >
                  {m.cloud}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => (
            <tr
              key={product.id}
              className="transition-colors duration-150 hover:bg-zinc-50/50"
            >
              <td className="sticky left-0 z-10 bg-surface px-6 py-3.5">
                <Link
                  href={`/products/${product.id}`}
                  className="type-body font-semibold hover:underline"
                >
                  {product.name}
                </Link>
              </td>
              {marketplaces.map((m) => {
                const cell = getMatrixCell(product.id, m.id);
                const status: Status = cell?.status ?? "not_started";
                const tip = cell
                  ? [
                      cell.blockers.length
                        ? `Blockers: ${cell.blockers.join("; ")}`
                        : null,
                      cell.listedAt ? `Listed ${cell.listedAt}` : null,
                      cell.submittedAt ? `Submitted ${cell.submittedAt}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || STATUS_TIP[status]
                  : "No listing record";

                return (
                  <td key={m.id} className="px-4 py-3.5" title={tip}>
                    <StatusBadge status={status} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
