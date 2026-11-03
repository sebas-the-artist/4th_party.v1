import { AddLocationForm } from "@/components/add-location-form";
import { LocationsBoard } from "@/components/locations-board";
import { SetupGuide } from "@/components/setup-guide";
import { setupProgress } from "@/domain/setup";
import { getActiveLocation } from "@/lib/store-context";
import { getWorkspace, locationCards } from "@/lib/workspace";

export default async function LocationsPage() {
  const workspace = await getWorkspace();
  const active = await getActiveLocation(workspace);
  const cards = locationCards(workspace, active?.id);
  const setup = setupProgress(workspace, active);

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Locations</p>
          <h1 className="page-header__title">
            {cards.length === 0 ? "Add the first store" : "Stores on this account"}
          </h1>
          <p className="page-header__text">
            Each store can have its own DoorDash, Uber, and bank. Membership
            later bills per store that stays active. Nothing is charged yet.
          </p>
        </div>
      </header>

      <SetupGuide setup={setup} />

      {cards.length === 0 ? (
        <article className="note-card">
          <p className="metric-card__label">Start here</p>
          <AddLocationForm />
        </article>
      ) : (
        <>
          <LocationsBoard cards={cards} />
          <section className="section">
            <h2 className="section__title">Add another location</h2>
            <article className="note-card">
              <AddLocationForm />
            </article>
          </section>
        </>
      )}
    </section>
  );
}
