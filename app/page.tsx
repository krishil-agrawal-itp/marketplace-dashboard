import { OverviewView } from "@/components/views/OverviewView";
import {
  getExecutiveKpis,
  getMarketplaceSummaries,
  getProductRows,
  getRisks,
} from "@/lib/data";

export default function HomePage() {
  return (
    <OverviewView
      kpis={getExecutiveKpis()}
      summaries={getMarketplaceSummaries()}
      topProducts={getProductRows().slice(0, 6)}
      risks={getRisks({ openOnly: true }).slice(0, 5)}
    />
  );
}
