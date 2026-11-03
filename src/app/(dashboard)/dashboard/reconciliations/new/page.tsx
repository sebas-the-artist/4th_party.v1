import Link from "next/link";
import { IngestForm } from "@/components/ingest-form";
import { SetupGuide } from "@/components/setup-guide";
import { setupProgress } from "@/domain/setup";
import { getScopedWorkspace } from "@/lib/workspace";

export default async function NewReconciliationPage() {
  const { workspace, location } = await getScopedWorkspace();
  const locationId = location?.id ?? "";
  const setup = setupProgress(workspace, location);

  return (
    <section>
      <Link className="page-back" href="/dashboard/reconciliations">
        ← Reconciliations
      </Link>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Ingest</p>
          <h1 className="page-header__title">Run the three files</h1>
          <p className="page-header__text">
            POS tickets, delivery payout, bank deposit — same week, same store.
            Upload or paste. You send any dispute letter from your own inbox.
          </p>
        </div>
      </header>

      <SetupGuide setup={setup} />

      {locationId ? (
        setup.readyToMatch ? (
          <IngestForm locationId={locationId} />
        ) : (
          <p className="empty-state">
            Connect POS, at least one app, and the bank on Integrations first.
            Then this form opens. That is how the three-way match knows what to
            expect.
          </p>
        )
      ) : (
        <p className="empty-state">
          Add a store on Locations, then come back to run a week.
        </p>
      )}
    </section>
  );
}
