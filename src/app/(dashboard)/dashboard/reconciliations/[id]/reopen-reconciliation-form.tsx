"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  reopenReconciliation,
  type ReopenReconciliationState,
} from "./actions";

const initialState: ReopenReconciliationState = {};

function ReopenButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="button button--secondary button--resolve"
      disabled={pending}
    >
      {pending ? "Reopening..." : "Reopen as exception"}
    </button>
  );
}

export function ReopenReconciliationForm({ id }: { id: string }) {
  const [state, formAction] = useActionState(
    reopenReconciliation,
    initialState,
  );

  return (
    <form action={formAction} className="reopen-form">
      <input type="hidden" name="id" value={id} />

      <label className="reopen-form__field">
        <span className="reopen-form__label">Exception reason</span>
        <select
          name="status"
          className="reopen-form__select"
          defaultValue="Short deposit"
        >
          <option value="Short deposit">Short deposit</option>
          <option value="Error charge">Error charge</option>
          <option value="Unmatched refund">Unmatched refund</option>
        </select>
      </label>

      {state.error ? (
        <p className="reopen-form__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <ReopenButton />
    </form>
  );
}
