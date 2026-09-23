import { ReportView } from "@/components/views/ReportView";
import { getMarketplaceSummaries, getProductRows } from "@/lib/data";

export default function ReportsPage() {
  return (
    <ReportView
      summaries={getMarketplaceSummaries()}
      products={getProductRows()}
      generatedAt="2026-09-22"
    />
  );
}
