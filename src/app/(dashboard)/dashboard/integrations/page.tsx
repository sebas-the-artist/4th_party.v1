import { toggleSourceAction } from "@/app/(dashboard)/dashboard/actions";
import { platformLabel } from "@/domain/types";
import { getScopedWorkspace, sourceCards } from "@/lib/workspace";

export default async function IntegrationsPage() {
  const { scoped } = await getScopedWorkspace();
  const sources = sourceCards(scoped);

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Integrations</p>
          <h1 className="page-header__title">Feeds for this store</h1>
          <p className="page-header__text">
            Pause a feed if you do not want it in this week’s match. Live APIs
            come later; these toggles already change what the matcher uses.
          </p>
        </div>
      </header>

      {sources.length === 0 ? (
        <p className="empty-state">Select or add a location to see its feeds.</p>
      ) : (
        <div className="settings-list">
          {sources.map((source) => (
            <article key={source.id} className="settings-item">
              <div>
                <p className="attention-row__title">{source.label}</p>
                <p className="attention-row__meta">
                  {source.platform ? platformLabel(source.platform) : source.kind}
                  {source.commissionBps ? ` · ${source.commissionBps / 100}% contracted commission` : ""}
                  {source.supportEmail ? ` · dispute mail ${source.supportEmail}` : ""}
                </p>
              </div>
              <div>
                <p className="money">{source.maskedCredential}</p>
                <form action={toggleSourceAction}>
                  <input type="hidden" name="sourceId" value={source.id} />
                  <button className="button button--ghost" type="submit">
                    {source.connected ? "Using this feed — pause" : "Use this feed"}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
