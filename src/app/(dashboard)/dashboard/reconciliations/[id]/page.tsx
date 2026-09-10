import "@/styles/dashboard.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReconciliationById } from "@/lib/reconciliations";
import { resolveReconciliation } from "./actions";
import { ReopenReconciliationForm } from "./reopen-reconciliation-form";

type ReconciliationDetailPageProps = {
  params: Promise<{
    id: string;
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

export default async function ReconciliationDetailPage({
  params,
}: ReconciliationDetailPageProps) {
  const { id } = await params;
  const reconciliation = await getReconciliationById(id);

  if (!reconciliation) {
    notFound();
  }

  return (
    <section className="page-shell">
      <Link
        href="/dashboard/reconciliations"
        className="page-back-link"
      >
        ← Back to reconciliations
      </Link>

      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Reconciliation detail</p>
          <h1 className="page-header__title">{reconciliation.store}</h1>
          <p className="page-header__text">
            {reconciliation.platform} payout reviewed on{" "}
            {reconciliation.date} at {reconciliation.time}.
          </p>
        </div>

        <div className="page-header__meta">
          <p className="page-header__meta-label">Status</p>

          <span className={getStatusClass(reconciliation.status)}>
            {reconciliation.status}
          </span>

          {reconciliation.status !== "Matched" ? (
            <form action={resolveReconciliation}>
              <input type="hidden" name="id" value={reconciliation.id} />

              <button
                type="submit"
                className="button button--primary button--resolve"
              >
                Resolve exception
              </button>
            </form>
          ) : (
            <ReopenReconciliationForm id={reconciliation.id} />
          )}
        </div>
      </div>

      <div className="detail-grid">
        <article className="section-card detail-card">
          <p className="detail-card__label">Expected payout</p>
          <p className="detail-card__value">
            {reconciliation.expected}
          </p>
        </article>

        <article className="section-card detail-card">
          <p className="detail-card__label">Received payout</p>
          <p className="detail-card__value">
            {reconciliation.received}
          </p>
        </article>

        <article className="section-card detail-card">
          <p className="detail-card__label">Variance</p>
          <p
            className={`detail-card__value ${
              reconciliation.status === "Matched"
                ? "detail-card__value--neutral"
                : "detail-card__value--negative"
            }`}
          >
            {reconciliation.variance}
          </p>
        </article>
      </div>

      <article className="section-card detail-note">
        <p className="detail-note__label">Review note</p>
        <p className="detail-note__text">{reconciliation.note}</p>
      </article>
    </section>
  );
}
