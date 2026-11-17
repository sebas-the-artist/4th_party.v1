import { toggleSourceAction } from "@/app/(dashboard)/dashboard/actions";
import { SetupGuide } from "@/components/setup-guide";
import { platformLabel } from "@/domain/types";
import { setupProgress } from "@/domain/setup";
import { getScopedWorkspace, sourceCards } from "@/lib/workspace";

const KIND_COPY = {
  delivery: {
    title: "Delivery apps — start here",
    text: "Turn on every app this store sells on. Then upload that app’s payout CSV. Live APIs come later.",
  },
  pos: {
    title: "POS — optional",
    text: "Tickets prove the food was made. Add Toast or Square when you want that in the letter. Not required to find clawbacks.",
  },
  bank: {
    title: "Bank — optional",
    text: "The deposit proves the payout landed. Add it when you want the third leg. Not a gate.",
  },
} as const;

export default async function IntegrationsPage() {
  const { workspace, scoped, location } = await getScopedWorkspace();
  const sources = sourceCards(scoped);
  const setup = setupProgress(workspace, location);

  const groups = (["delivery", "pos", "bank"] as const).map((kind) => ({
    kind,
    ...KIND_COPY[kind],
    items: sources.filter((source) => source.kind === kind),
  }));

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Integrations</p>
          <h1 className="page-header__title">
            {location ? `${location.name} feeds` : "Connect the three legs"}
          </h1>
          <p className="page-header__text">
            Flip DoorDash / Uber / Grubhub first. Then upload the payout file
            the morning it appears — not next Sunday. POS and bank are extra
            proof, not a gate.
          </p>
        </div>
      </header>

      <SetupGuide setup={setup} variant="compact" />

      {sources.length === 0 ? (
        <p className="empty-state">
          Add a store first, then these feeds show up.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.kind} className="section">
            <h2 className="section__title">{group.title}</h2>
            <p className="page-header__text">{group.text}</p>
            <div className="settings-list">
              {group.items.map((source) => (
                <article key={source.id} className="settings-item">
                  <div>
                    <p className="attention-row__title">{source.label}</p>
                    <p className="attention-row__meta">
                      {source.platform ? platformLabel(source.platform) : source.kind}
                      {source.commissionBps
                        ? ` · ${source.commissionBps / 100}% contracted commission`
                        : ""}
                    </p>
                  </div>
                  <form action={toggleSourceAction}>
                    <input type="hidden" name="sourceId" value={source.id} />
                    <button
                      className={`button ${source.connected ? "button--primary" : "button--ghost"}`}
                      type="submit"
                    >
                      {source.connected ? "Connected — pause" : "Connect"}
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </section>
  );
}
