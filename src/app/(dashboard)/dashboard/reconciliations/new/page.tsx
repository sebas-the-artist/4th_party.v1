import Link from "next/link";
import { IngestForm } from "@/components/ingest-form";
import { SetupGuide } from "@/components/setup-guide";
import { setupProgress } from "@/domain/setup";
import { getScopedWorkspace } from "@/lib/workspace";

export default async function NewReconciliationPage() {
  const { workspace, location } = await getScopedWorkspace();
  const locationId = location?.id ?? "";
  const setup = setupProgress(workspace, location);
  const defaultPlatform = workspace.sources.find(
    (source) => source.locationId === locationId && source.kind === "delivery" && source.connected,
  )?.platform;

  return (
    <section>
      <Link className="page-back" href="/dashboard/reconciliations">
        ← Ledger
      </Link>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Payout file</p>
          <h1 className="page-header__title">Drop the export as soon as it exists</h1>
          <p className="page-header__text">
            One payout CSV is enough. Do not sit on it until Sunday — platforms
            give about 30 days. POS and bank are optional. Letters still go from
            your inbox.
          </p>
        </div>
      </header>

      <SetupGuide setup={setup} variant="compact" />

      {locationId ? (
        setup.readyToMatch ? (
          <IngestForm locationId={locationId} defaultPlatform={defaultPlatform} />
        ) : (
          <p className="empty-state">
            Add a store and turn on at least one app on Feeds. Then this
            upload opens.
          </p>
        )
      ) : (
        <p className="empty-state">Add a store on Locations, then come back.</p>
      )}
    </section>
  );
}
