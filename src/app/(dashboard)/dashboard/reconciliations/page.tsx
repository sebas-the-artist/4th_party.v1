import Link from "next/link";
import { LiveFilterForm } from "@/components/live-filter-form";
import { StatusBadge } from "@/components/status-badge";
import { formatCents } from "@/domain/money";
import { MATCH_STATUSES, matchStatusLabel, platformLabel } from "@/domain/types";
import { filterMatches, getScopedWorkspace, latestRunMatches } from "@/lib/workspace";

export default async function ReconciliationsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { scoped } = await getScopedWorkspace();
  const run = scoped.runs[0];
  const rows = filterMatches(latestRunMatches(scoped), {
    platform: params.platform,
    status: params.status,
    query: params.q,
  });

  const href = (next: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    const merged = {
      platform: params.platform,
      status: params.status,
      q: params.q,
      ...next,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value && value !== "all") query.set(key, value);
    }
    const text = query.toString();
    return text ? `/dashboard/reconciliations?${text}` : "/dashboard/reconciliations";
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Reconciliations</p>
          <h1 className="page-header__title">Week match</h1>
          <p className="page-header__text">
            {run
              ? `${run.periodStart} → ${run.periodEnd}. Change a filter and the list updates. Tap a row to collect.`
              : "Run a week to see the ledger for this store."}
          </p>
        </div>
        <Link className="button button--primary" href="/dashboard/reconciliations/new">
          Paste CSVs
        </Link>
      </header>

      <LiveFilterForm action="/dashboard/reconciliations">
        <label className="filter-bar__field">
          Platform
          <select name="platform" defaultValue={params.platform ?? "all"}>
            <option value="all">All platforms</option>
            <option value="doordash">DoorDash</option>
            <option value="uber_eats">Uber Eats</option>
            <option value="grubhub">Grubhub</option>
            <option value="bank">Bank</option>
          </select>
        </label>
        <label className="filter-bar__field">
          Status
          <select name="status" defaultValue={params.status ?? "all"}>
            <option value="all">All statuses</option>
            {MATCH_STATUSES.map((status) => (
              <option key={status} value={status}>
                {matchStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-bar__field filter-bar__field--grow">
          Search
          <input name="q" defaultValue={params.q ?? ""} placeholder="Order, ticket, or note" />
        </label>
      </LiveFilterForm>

      {rows.length === 0 ? (
        <p className="empty-state">Nothing matches those filters. Clear them or switch stores.</p>
      ) : (
        <div className="data-table-wrap data-table-wrap--stack">
          <table className="data-table">
            <thead>
              <tr>
                <th>Line</th>
                <th>Expected</th>
                <th>Received</th>
                <th>Variance</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td data-label="Line">
                    <Link className="table-link" href={`/dashboard/reconciliations/${row.id}`}>
                      {platformLabel(row.platform)}
                      <div className="attention-row__meta">{row.summary}</div>
                    </Link>
                  </td>
                  <td data-label="Expected" className="money">
                    {formatCents(row.expectedCents)}
                  </td>
                  <td data-label="Received" className="money">
                    {formatCents(row.receivedCents)}
                  </td>
                  <td data-label="Variance" className="money">
                    {formatCents(row.varianceCents)}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={row.status} recoveredCents={row.recoveredCents} />
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
      <p className="filter-bar__hint">
        <Link href={href({})}>Show everything</Link>
        {" · "}
        <Link href="/dashboard/locations">Switch location</Link>
      </p>
    </section>
  );
}
