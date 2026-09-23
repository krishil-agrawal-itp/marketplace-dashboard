import { ProgressUpdatesSection } from "@/components/ProgressUpdatesSection";
import {
  getDailyProgressEntries,
  getMarketplaces,
  getProducts,
  getProgressUpdates,
} from "@/lib/data";

export default function ProgressPage() {
  return (
    <ProgressUpdatesSection
      initialUpdates={getProgressUpdates()}
      initialDailyEntries={getDailyProgressEntries()}
      products={getProducts().map((p) => ({ id: p.id, name: p.name }))}
      marketplaces={getMarketplaces().map((m) => ({
        id: m.id,
        name: m.name,
      }))}
    />
  );
}
