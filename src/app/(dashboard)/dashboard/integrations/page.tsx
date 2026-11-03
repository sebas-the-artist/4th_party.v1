import { toggleSourceAction } from "@/app/(dashboard)/dashboard/actions";
import { SetupGuide } from "@/components/setup-guide";
import { platformLabel } from "@/domain/types";
import { setupProgress } from "@/domain/setup";
import { getScopedWorkspace, sourceCards } from "@/lib/workspace";

const KIND_COPY = {
  pos: {
    title: "POS",
    text: "Tickets prove the food was made. Connect the system that prints the ticket.",
  },
  delivery: {
    title: "Delivery apps",
    text: "Turn on every app this store actually sells on. Leave the rest off.",
  },
  bank: {
    title: "Bank",
    text: "The deposit is the third leg. Without it we cannot tell if DoorDash actually paid you.",
  },
} as const;

export default async function IntegrationsPage() {
  const { workspace, scoped, location } = await getScopedWorkspace();
  const sources = sourceCards(scoped);
  const setup = setupProgress(workspace, location);

  const groups = (["pos", "delivery", "bank"] as const).map((kind) => ({
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
            Live APIs come later. For now these toggles tell the matcher which
            POS, apps, and bank to expect when you paste CSVs.
          </p>
        </div>
      </header>

      <SetupGuide setup={setup} />

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
