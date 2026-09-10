"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createReconciliation,
  type CreateReconciliationState,
} from "./actions";

const initialState: CreateReconciliationState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="button button--primary"
      disabled={pending}
    >
      {pending ? "Creating payout..." : "Create reconciliation"}
    </button>
  );
}

export function CreateReconciliationForm() {
  const [state, formAction] = useActionState(
    createReconciliation,
    initialState,
  );

  return (
    <form action={formAction} className="section-card form-card">
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
            inputMode="decimal"
            placeholder="$2,450.00"
            required
          />
        </label>

        <label className="form-field">
          <span className="form-field__label">Received payout</span>
          <input
            className="form-field__input"
            name="received"
            inputMode="decimal"
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

      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="form-card__footer">
        <a
          href="/dashboard/reconciliations"
          className="button button--secondary"
        >
          Cancel
        </a>

        <SubmitButton />
      </div>
    </form>
  );
}
