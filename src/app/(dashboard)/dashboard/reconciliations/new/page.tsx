import "@/styles/dashboard.css";
import Link from "next/link";
import { CreateReconciliationForm } from "./create-reconciliation-form";

export default function NewReconciliationPage() {
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
          <p className="page-header__eyebrow">New reconciliation</p>
          <h1 className="page-header__title">Add a payout</h1>
          <p className="page-header__text">
            Record the expected and received payout amounts for review.
          </p>
        </div>
      </div>

      <CreateReconciliationForm />
    </section>
  );
}


/* import "@/styles/dashboard.css";
import Link from "next/link";
import { createReconciliation } from "./actions";

export default function NewReconciliationPage() {
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
          <p className="page-header__eyebrow">New reconciliation</p>
          <h1 className="page-header__title">Add a payout</h1>
          <p className="page-header__text">
            Record the expected and received payout amounts for review.
          </p>
        </div>
      </div>

      <form action={createReconciliation} className="section-card form-card">
        <div className="form-grid">
          <label className="form-field">
            <span className="form-field__label">Store</span>
            <input
              className="form-field__input"
              name="store"
              placeholder="Store 042"
              required
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">Platform</span>
            <select
              className="form-field__input"
              name="platform"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Choose a platform
              </option>
              <option value="DoorDash">DoorDash</option>
              <option value="Uber Eats">Uber Eats</option>
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">Expected payout</span>
            <input
              className="form-field__input"
              name="expected"
              placeholder="$2,450.00"
              required
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">Received payout</span>
            <input
              className="form-field__input"
              name="received"
              placeholder="$2,400.00"
              required
            />
          </label>

          <label className="form-field form-field--full">
            <span className="form-field__label">Review note</span>
            <textarea
              className="form-field__input form-field__textarea"
              name="note"
              placeholder="What should someone verify about this payout?"
              required
            />
          </label>
        </div>

        <div className="form-card__footer">
          <Link
            href="/dashboard/reconciliations"
            className="button button--secondary"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="button button--primary"
          >
            Create reconciliation
          </button>
        </div>
      </form>
    </section>
  );
}
 */