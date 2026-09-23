import { ProductsView } from "@/components/views/ProductsView";
import {
  getMarketplaces,
  getOwners,
  getProductRows,
  getProducts,
} from "@/lib/data";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    owner?: string;
    marketplace?: string;
    status?: string;
    category?: string;
    risk?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const products = getProducts();
  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <ProductsView
      products={getProductRows()}
      owners={getOwners()}
      categories={categories}
      marketplaces={getMarketplaces().map((m) => ({
        id: m.id,
        name: m.name,
      }))}
      initialOwner={params.owner ?? ""}
      initialMarketplace={params.marketplace ?? ""}
      initialStatus={params.status ?? ""}
      initialCategory={params.category ?? ""}
      initialRisk={
        params.risk === "flagged" || params.risk === "clear"
          ? params.risk
          : "all"
      }
      initialSort={(params.sort as never) ?? "mau-desc"}
      initialQuery={params.q ?? ""}
    />
  );
}
