import { DashboardApp } from "@/components/DashboardApp";
import {
  getDailyProgressEntries,
  getExecutiveKpis,
  getMarketplaces,
  getMarketplaceSummaries,
  getOwners,
  getProductRows,
  getProducts,
  getProgressUpdates,
  getRisks,
} from "@/lib/data";

export default function HomePage() {
  const products = getProducts();
  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <DashboardApp
      kpis={getExecutiveKpis()}
      summaries={getMarketplaceSummaries()}
      products={getProductRows()}
      risks={getRisks({ openOnly: true })}
      owners={getOwners()}
      categories={categories}
      marketplaces={getMarketplaces().map((m) => ({
        id: m.id,
        name: m.name,
      }))}
      progressUpdates={getProgressUpdates()}
      dailyProgressEntries={getDailyProgressEntries()}
      productOptions={products.map((p) => ({ id: p.id, name: p.name }))}
      generatedAt="2026-09-22"
    />
  );
}
