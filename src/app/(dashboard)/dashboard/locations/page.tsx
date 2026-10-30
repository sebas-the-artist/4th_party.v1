import { AddLocationForm } from "@/components/add-location-form";
import { LocationsBoard } from "@/components/locations-board";
import { getActiveLocation } from "@/lib/store-context";
import { getWorkspace, locationCards } from "@/lib/workspace";

export default async function LocationsPage() {
  const workspace = await getWorkspace();
  const active = await getActiveLocation(workspace);
  const cards = locationCards(workspace, active?.id);

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Locations</p>
          <h1 className="page-header__title">Stores on this account</h1>
          <p className="page-header__text">
            Billing can later charge per active linked location. Nothing is billed
            here yet — this list is the source of truth for store count.
          </p>
        </div>
      </header>

      {cards.length === 0 ? (
        <div className="empty-state">
          <p>No locations yet. Add the first store to start reconciling payouts.</p>
        </div>
      ) : (
        <LocationsBoard cards={cards} />
      )}

      <section className="section">
        <h2 className="section__title">Add a location</h2>
        <article className="note-card">
          <AddLocationForm />
        </article>
      </section>
    </section>
  );
}
