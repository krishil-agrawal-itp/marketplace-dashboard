import { MarketplacesView } from "@/components/views/MarketplacesView";
import { getMarketplaceSummaries } from "@/lib/data";

export default function MarketplacesPage() {
  return <MarketplacesView summaries={getMarketplaceSummaries()} />;
}
