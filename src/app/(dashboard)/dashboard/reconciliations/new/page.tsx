import Link from "next/link";
import { IngestForm } from "@/components/ingest-form";
import { getScopedWorkspace } from "@/lib/workspace";

export default async function NewReconciliationPage() {
  const { location } = await getScopedWorkspace();
  const locationId = location?.id ?? "";

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
            Upload or paste POS, delivery, and bank CSVs for the selected store.
            Quoted cells are fine. Amounts are dollars, stored as integer cents.
          </p>
        </div>
      </header>
      {locationId ? <IngestForm locationId={locationId} /> : <p>Select a location first.</p>}
    </section>
  );
}
