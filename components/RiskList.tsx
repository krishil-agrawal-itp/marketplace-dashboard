import Link from "next/link";
import { getMarketplaceById, getProductById } from "@/lib/data";
import type { Risk } from "@/lib/types";
import { cn } from "@/lib/utils";

const severityClass: Record<string, string> = {
  P0: "bg-error text-white",
  P1: "bg-warning text-white",
  P2: "bg-warning-soft text-warning",
  P3: "bg-surface-secondary text-text-secondary",
};

export function RiskList({ risks }: { risks: Risk[] }) {
  if (risks.length === 0) {
    return <p className="type-caption py-6 text-center">No open risks.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {risks.map((risk) => {
        const product = risk.relatedProductId
          ? getProductById(risk.relatedProductId)
          : null;
        const marketplace = risk.relatedMarketplaceId
          ? getMarketplaceById(risk.relatedMarketplaceId)
          : null;

        return (
          <li key={risk.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
            <span
              className={cn(
                "type-caption mt-0.5 h-fit shrink-0 rounded-sm px-1.5 py-0.5 font-bold",
                severityClass[risk.severity],
              )}
            >
              {risk.severity}
            </span>
            <div className="min-w-0 flex-1">
              <p className="type-body font-semibold">{risk.title}</p>
              <p className="type-caption mt-0.5">{risk.detail}</p>
              <p className="type-caption mt-1.5">
                Owner: {risk.owner}
                {product ? (
                  <>
                    {" · "}
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-text-primary underline-offset-2 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </>
                ) : null}
                {marketplace ? ` · ${marketplace.name}` : null}
                {" · "}
                <span className="capitalize">{risk.status}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
