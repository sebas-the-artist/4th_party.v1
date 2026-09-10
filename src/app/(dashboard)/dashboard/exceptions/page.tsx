import "@/styles/dashboard.css";
import Link from "next/link";
import { getExceptions } from "@/lib/reconciliations";

export default async function ExceptionsPage() {
  const exceptions = await getExceptions();

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Exceptions</p>
          <h1 className="page-header__title">Open issues</h1>
          <p className="page-header__text">
            Track anything that still needs attention before it becomes a bigger problem.
          </p>
        </div>

        <div className="page-header__meta">
          <p className="page-header__meta-label">Open items</p>
          <p className="page-header__meta-value">{exceptions.length}</p>
        </div>
      </div>

      {exceptions.length === 0 ? (
        <article className="section-card empty-state">
          <div className="empty-state__icon" aria-hidden="true">
            ✓
          </div>

          <p className="empty-state__eyebrow">All clear</p>
          <h2 className="empty-state__title">No open exceptions</h2>
          <p className="empty-state__text">
            Every reconciliation is currently matched. Nice work.
          </p>

          <Link
            href="/dashboard/reconciliations"
            className="button button--primary empty-state__button"
          >
            View reconciliations
          </Link>
        </article>
      ) : (
        <div className="exceptions__list">
          {exceptions.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/reconciliations/${item.id}`}
              className="section-card exception-card exception-card--link"
            >
              <div className="exception-card__main">
                <p className="exception-card__title">
                  {item.store} • {item.platform}
                </p>
                <p className="exception-card__text">{item.issue}</p>
              </div>

              <div className="exception-card__side">
                <p className="exception-card__amount">{item.amount}</p>
                <p className="exception-card__meta">{item.age}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}


/* import "@/styles/dashboard.css";
import Link from "next/link";
import { getExceptions } from "@/lib/reconciliations";

export default async function ExceptionsPage() {
  const exceptions = await getExceptions();

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Exceptions</p>
          <h1 className="page-header__title">Open issues</h1>
          <p className="page-header__text">
            Track anything that still needs attention before it becomes a bigger problem.
          </p>
        </div>

        <div className="page-header__meta">
          <p className="page-header__meta-label">Open items</p>
          <p className="page-header__meta-value">{exceptions.length}</p>
        </div>
      </div>

      <div className="exceptions__list">
        {exceptions.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/reconciliations/${item.id}`}
            className="section-card exception-card exception-card--link"
          >
            <div className="exception-card__main">
              <p className="exception-card__title">
                {item.store} • {item.platform}
              </p>
              <p className="exception-card__text">{item.issue}</p>
            </div>

            <div className="exception-card__side">
              <p className="exception-card__amount">{item.amount}</p>
              <p className="exception-card__meta">{item.age}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
 */