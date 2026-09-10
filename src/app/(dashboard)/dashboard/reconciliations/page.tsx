import "@/styles/dashboard.css";
import Link from "next/link";
import { getReconciliations } from "@/lib/reconciliations";

type ReconciliationsPageProps = {
  searchParams: Promise<{
    query?: string;
    status?: string;
    platform?: string;
  }>;
};

function getStatusClass(status: string) {
  switch (status) {
    case "Matched":
      return "status-pill status-pill--matched";
    case "Short deposit":
      return "status-pill status-pill--short-deposit";
    case "Error charge":
      return "status-pill status-pill--error-charge";
    case "Unmatched refund":
      return "status-pill status-pill--unmatched-refund";
    default:
      return "status-pill";
  }
}

export default async function ReconciliationsPage({
  searchParams,
}: ReconciliationsPageProps) {
  const params = await searchParams;
  const query = params.query?.trim().toLowerCase() ?? "";
  const status = params.status ?? "all";
  const platform = params.platform ?? "all";

  const reconciliations = await getReconciliations();

  const filteredReconciliations = reconciliations.filter((item) => {
    const matchesQuery =
      !query ||
      item.store.toLowerCase().includes(query) ||
      item.platform.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query);

    const matchesStatus = status === "all" || item.status === status;
    const matchesPlatform = platform === "all" || item.platform === platform;

    return matchesQuery && matchesStatus && matchesPlatform;
  });

  const openExceptions = reconciliations.filter(
    (item) => item.status !== "Matched",
  ).length;

  const hasFilters = query || status !== "all" || platform !== "all";

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Reconciliations</p>
          <h1 className="page-header__title">Payout reconciliation</h1>
          <p className="page-header__text">
            Compare expected marketplace payouts with what reached your bank.
          </p>
        </div>

        <div className="page-header__meta">
          <p className="page-header__meta-label">Total records</p>
          <p className="page-header__meta-value">{reconciliations.length}</p>

          <Link
            href="/dashboard/reconciliations/new"
            className="button button--primary button--header"
          >
            + Add payout
          </Link>
        </div>
      </div>

      <section className="data-card">
        <div className="data-card__header">
          <div>
            <h2 className="data-card__title">All payouts</h2>
            <p className="data-card__text">
              {openExceptions === 0
                ? "Everything is currently reconciled."
                : `${openExceptions} ${
                    openExceptions === 1 ? "payout needs" : "payouts need"
                  } attention.`}
            </p>
          </div>

          <p className="data-card__count">
            {filteredReconciliations.length} of {reconciliations.length}
          </p>
        </div>

        <form className="data-toolbar" action="/dashboard/reconciliations">
          <label className="data-toolbar__search">
            <span className="sr-only">Search reconciliations</span>
            <span className="data-toolbar__search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              className="data-toolbar__input"
              type="search"
              name="query"
              defaultValue={params.query ?? ""}
              placeholder="Search store, platform, or ID"
            />
          </label>

          <label className="data-toolbar__select-wrap">
            <span className="sr-only">Filter by status</span>
            <select
              className="data-toolbar__select"
              name="status"
              defaultValue={status}
            >
              <option value="all">All statuses</option>
              <option value="Matched">Matched</option>
              <option value="Short deposit">Short deposit</option>
              <option value="Error charge">Error charge</option>
              <option value="Unmatched refund">Unmatched refund</option>
            </select>
          </label>

          <label className="data-toolbar__select-wrap">
            <span className="sr-only">Filter by platform</span>
            <select
              className="data-toolbar__select"
              name="platform"
              defaultValue={platform}
            >
              <option value="all">All platforms</option>
              <option value="DoorDash">DoorDash</option>
              <option value="Uber Eats">Uber Eats</option>
            </select>
          </label>

          <button type="submit" className="button button--secondary">
            Filter
          </button>

          {hasFilters ? (
            <Link
              href="/dashboard/reconciliations"
              className="data-toolbar__clear"
            >
              Clear
            </Link>
          ) : null}
        </form>

        {filteredReconciliations.length === 0 ? (
          <div className="data-empty">
            <p className="data-empty__title">No payouts found</p>
            <p className="data-empty__text">
              Try adjusting your search or clearing the current filters.
            </p>

            {hasFilters ? (
              <Link
                href="/dashboard/reconciliations"
                className="button button--secondary"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
        ) : (
          <div
            className="data-card__table-wrap"
            role="region"
            aria-label="Payout reconciliation records"
            tabIndex={0}
          >
            <table className="reconciliation-table">
              <thead>
                <tr>
                  <th scope="col">Store</th>
                  <th scope="col">Platform</th>
                  <th scope="col">Expected</th>
                  <th scope="col">Received</th>
                  <th scope="col">Variance</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">View details</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredReconciliations.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link
                        href={`/dashboard/reconciliations/${item.id}`}
                        className="reconciliation-table__store-link"
                      >
                        {item.store}
                        <span className="reconciliation-table__id">
                          ID {item.id}
                        </span>
                      </Link>
                    </td>

                    <td>
                      <span className="reconciliation-table__platform">
                        {item.platform}
                      </span>
                    </td>

                    <td className="reconciliation-table__amount">
                      {item.expected}
                    </td>

                    <td className="reconciliation-table__amount">
                      {item.received}
                    </td>

                    <td
                      className={`reconciliation-table__amount ${
                        item.status === "Matched"
                          ? "reconciliation-table__amount--neutral"
                          : "reconciliation-table__amount--negative"
                      }`}
                    >
                      {item.variance}
                    </td>

                    <td>
                      <span className={getStatusClass(item.status)}>
                        {item.status}
                      </span>
                    </td>

                    <td className="reconciliation-table__action">
                      <Link
                        href={`/dashboard/reconciliations/${item.id}`}
                        className="reconciliation-table__view-link"
                        aria-label={`View ${item.store} reconciliation`}
                      >
                        View <span aria-hidden="true">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

/* import "@/styles/dashboard.css";
import Link from "next/link";
import { getReconciliations } from "@/lib/reconciliations";

function getStatusClass(status: string) {
  switch (status) {
    case "Matched":
      return "status-pill status-pill--matched";
    case "Short deposit":
      return "status-pill status-pill--short-deposit";
    case "Error charge":
      return "status-pill status-pill--error-charge";
    case "Unmatched refund":
      return "status-pill status-pill--unmatched-refund";
    default:
      return "status-pill";
  }
}

export default async function ReconciliationsPage() {
  const reconciliations = await getReconciliations();

  const openExceptions = reconciliations.filter(
    (item) => item.status !== "Matched",
  ).length;

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Reconciliations</p>
          <h1 className="page-header__title">Payout reconciliation</h1>
          <p className="page-header__text">
            Compare expected marketplace payouts with what reached your bank.
          </p>
        </div>

        <div className="page-header__meta">
          <p className="page-header__meta-label">Total records</p>
          <p className="page-header__meta-value">{reconciliations.length}</p>

          <Link
            href="/dashboard/reconciliations/new"
            className="button button--primary button--header"
          >
            + Add payout
          </Link>
        </div>
      </div>

      <section className="data-card">
        <div className="data-card__header">
          <div>
            <h2 className="data-card__title">All payouts</h2>
            <p className="data-card__text">
              {openExceptions === 0
                ? "Everything is currently reconciled."
                : `${openExceptions} ${
                    openExceptions === 1 ? "payout needs" : "payouts need"
                  } attention.`}
            </p>
          </div>

          <p className="data-card__count">
            {reconciliations.length}{" "}
            {reconciliations.length === 1 ? "record" : "records"}
          </p>
        </div>

        <div
          className="data-card__table-wrap"
          role="region"
          aria-label="Payout reconciliation records"
          tabIndex={0}
        >
          <table className="reconciliation-table">
            <thead>
              <tr>
                <th scope="col">Store</th>
                <th scope="col">Platform</th>
                <th scope="col">Expected</th>
                <th scope="col">Received</th>
                <th scope="col">Variance</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">View details</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {reconciliations.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link
                      href={`/dashboard/reconciliations/${item.id}`}
                      className="reconciliation-table__store-link"
                    >
                      {item.store}
                      <span className="reconciliation-table__id">
                        ID {item.id}
                      </span>
                    </Link>
                  </td>

                  <td>
                    <span className="reconciliation-table__platform">
                      {item.platform}
                    </span>
                  </td>

                  <td className="reconciliation-table__amount">
                    {item.expected}
                  </td>

                  <td className="reconciliation-table__amount">
                    {item.received}
                  </td>

                  <td
                    className={`reconciliation-table__amount ${
                      item.status === "Matched"
                        ? "reconciliation-table__amount--neutral"
                        : "reconciliation-table__amount--negative"
                    }`}
                  >
                    {item.variance}
                  </td>

                  <td>
                    <span className={getStatusClass(item.status)}>
                      {item.status}
                    </span>
                  </td>

                  <td className="reconciliation-table__action">
                    <Link
                      href={`/dashboard/reconciliations/${item.id}`}
                      className="reconciliation-table__view-link"
                      aria-label={`View ${item.store} reconciliation`}
                    >
                      View <span aria-hidden="true">→</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
 */

/* import "@/styles/dashboard.css";
import Link from "next/link";
import { getReconciliations } from "@/lib/reconciliations";

function getStatusClass(status: string) {
  switch (status) {
    case "Matched":
      return "status-pill status-pill--matched";
    case "Short deposit":
      return "status-pill status-pill--short-deposit";
    case "Error charge":
      return "status-pill status-pill--error-charge";
    case "Unmatched refund":
      return "status-pill status-pill--unmatched-refund";
    default:
      return "status-pill";
  }
}

export default async function ReconciliationsPage() {
  const reconciliations = await getReconciliations();

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Reconciliations</p>
          <h1 className="page-header__title">Payout reconciliation</h1>
          <p className="page-header__text">
            Compare expected marketplace payouts with what reached your bank.
          </p>
        </div>

        <div className="page-header__meta">
          <p className="page-header__meta-label">Total records</p>
          <p className="page-header__meta-value">{reconciliations.length}</p>

          <Link
            href="/dashboard/reconciliations/new"
            className="button button--primary button--header"
          >
            + Add payout
          </Link>
        </div>

      </div>

      <div className="section-card reconciliation-table-wrap">
        <table className="reconciliation-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Platform</th>
              <th>Expected</th>
              <th>Received</th>
              <th>Variance</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {reconciliations.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link
                    href={`/dashboard/reconciliations/${item.id}`}
                    className="reconciliation-table__link"
                  >
                    {item.store}
                  </Link>
                </td>
                <td>{item.platform}</td>
                <td>{item.expected}</td>
                <td>{item.received}</td>
                <td className="reconciliation-table__variance">
                  {item.variance}
                </td>
                <td>
                  <span className={getStatusClass(item.status)}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
 */