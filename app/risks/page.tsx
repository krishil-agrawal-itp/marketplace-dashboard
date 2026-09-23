import { PageHeader, PageShell } from "@/components/PageShell";
import { RiskList } from "@/components/RiskList";
import { getRisks } from "@/lib/data";

export default function RisksPage() {
  return (
    <PageShell>
      <PageHeader
        title="Risks & blockers"
        subtitle="Open P0–P2 items with owners and related products."
      />
      <div className="panel-pad">
        <RiskList risks={getRisks({ openOnly: true })} />
      </div>
    </PageShell>
  );
}
