"use client";

import { useActionState } from "react";
import { addLocationAction } from "@/app/(dashboard)/dashboard/actions";

export function AddLocationForm() {
  const [state, action] = useActionState(addLocationAction, {});

  return (
    <form className="ingest-form" action={action}>
      <div className="ingest-form__meta">
        <label>
          Store name
          <input name="name" required placeholder="Good Burger" />
        </label>
        <label>
          Store number
          <input name="storeNumber" required placeholder="014" />
        </label>
      </div>
      <label>
        Street address
        <input name="address" required placeholder="1234 Cape Coral Pkwy E" />
      </label>
      <div className="ingest-form__meta">
        <label>
          City
          <input name="city" required placeholder="Cape Coral" />
        </label>
        <label>
          State
          <input name="state" required maxLength={2} placeholder="FL" />
        </label>
        <label>
          ZIP
          <input name="postalCode" required placeholder="33904" />
        </label>
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <div className="ingest-form__footer">
        <button className="button button--primary" type="submit">
          Add location
        </button>
      </div>
    </form>
  );
}
