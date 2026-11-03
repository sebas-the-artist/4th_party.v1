import Link from "next/link";
import { SetupGuide } from "@/components/setup-guide";
import { StatusBadge } from "@/components/status-badge";
import { formatCents } from "@/domain/money";
import { setupProgress } from "@/domain/setup";
import { formatStoreLine, platformLabel } from "@/domain/types";
import { dashboardSummary, filterMatches, getScopedWorkspace } from "@/lib/workspace";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; recovered?: string }>;
}) {
  const params = await searchParams;
  const { workspace, scoped, location } = await getScopedWorkspace();
  const summary = dashboardSummary(scoped);
  const setup = setupProgress(workspace, location);
  const platform = params.platform ?? "all";
  const records = filterMatches(scoped.matches, { platform });

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">
            {location ? formatStoreLine(location) : "First store"}
          </p>
          <h1 className="page-header__title">
            {location ? summary.locationName : "Let’s get a store on the board"}
          </h1>
          <p className="page-header__text">
            {setup.complete
              ? "Red numbers are money still sitting with the apps. Tap one, send the letter, mark it recovered."
              : "Follow the checklist. We cannot find unpaid cancellations until the store, POS, an app, and the bank are on."}
          </p>
        </div>
        {setup.complete ? (
          <div className="page-header__actions">
            <Link className="button button--ghost" href="/dashboard/reconciliations">
              View all records
            </Link>
            <Link className="button button--primary" href="/dashboard/reconciliations/new">
              Run a week
            </Link>
          </div>
        ) : null}
      </header>

      <SetupGuide setup={setup} />

      {setup.complete ? (
        <>
          <div className="metric-grid">
            <article className="metric-card metric-card--alert">
              <p className="metric-card__label">Still with the apps</p>
              <p className="metric-card__value money">{summary.netVariance}</p>
            </article>
            <article className="metric-card">
              <p className="metric-card__label">Needs attention</p>
              <p className="metric-card__value">{summary.openExceptions}</p>
            </article>
            <article className="metric-card">
              <p className="metric-card__label">Matched rate</p>
              <p className="metric-card__value">{summary.matchedRate}%</p>
            </article>
            <article className="metric-card">
              <p className="metric-card__label">Recovered</p>
              <p className="metric-card__value money">{summary.recovered}</p>
            </article>
          </div>

          <section className="section">
            <h2 className="section__title">Go get this money</h2>
            {summary.attention.length === 0 ? (
              <p className="empty-state">This store is clean for the current week. Nice.</p>
            ) : (
              <div className="attention-list">
                {summary.attention.map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/reconciliations/${item.id}`}
                    className="attention-row"
                  >
                    <div>
                      <p className="attention-row__title">
                        {item.platform} · {item.statusLabel}
                      </p>
                      <p className="attention-row__meta">{item.summary}</p>
                    </div>
                    <div>
                      <p className="attention-row__amount money">{item.variance}</p>
                      <StatusBadge status={item.status} recoveredCents={item.recoveredCents} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="section">
            <div className="section__head">
              <h2 className="section__title">Records by platform</h2>
              <Link href="/dashboard/reconciliations">Open the full ledger</Link>
            </div>
            <div className="chip-row" role="tablist" aria-label="Filter by platform">
              <Link className={`chip ${platform === "all" ? "chip--active" : ""}`} href="/dashboard">
                All
              </Link>
              {(["doordash", "uber_eats", "grubhub"] as const).map((key) => (
                <Link
                  key={key}
                  className={`chip ${platform === key ? "chip--active" : ""}`}
                  href={`/dashboard?platform=${key}`}
                >
                  {platformLabel(key)}
                </Link>
              ))}
            </div>
            {records.length === 0 ? (
              <p className="empty-state">Nothing on this view this week. Run a week or try another chip.</p>
            ) : (
              <div className="data-table-wrap data-table-wrap--stack">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Line</th>
                      <th>Status</th>
                      <th>Variance</th>
                      <th>
                        <span className="sr-only">Open</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 12).map((row) => (
                      <tr key={row.id}>
                        <td data-label="Line">
                          <Link className="table-link" href={`/dashboard/reconciliations/${row.id}`}>
                            {platformLabel(row.platform)}
                            <div className="attention-row__meta">{row.summary}</div>
                          </Link>
                        </td>
                        <td data-label="Status">
                          <StatusBadge status={row.status} recoveredCents={row.recoveredCents} />
                        </td>
                        <td data-label="Variance" className="money">
                          {formatCents(row.varianceCents)}
                        </td>
                        <td>
                          <Link className="data-table__open" href={`/dashboard/reconciliations/${row.id}`}>
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
