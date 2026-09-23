import { DeploymentMatrix } from "@/components/DeploymentMatrix";
import { PageHeader, PageShell } from "@/components/PageShell";

export default function MatrixPage() {
  return (
    <PageShell>
      <PageHeader
        title="Deployment matrix"
        subtitle="Product × marketplace listing status. Hover a cell for blockers and dates."
      />
      <DeploymentMatrix />
    </PageShell>
  );
}
