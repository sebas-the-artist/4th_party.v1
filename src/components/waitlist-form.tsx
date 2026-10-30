"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlist, type WaitlistState } from "@/app/waitlist/actions";

const initial: WaitlistState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="waitlist-form__submit" type="submit" disabled={pending}>
      {pending ? "Sending…" : "Save me a seat"}
    </button>
  );
}

export function WaitlistForm() {
  const [state, action] = useActionState(joinWaitlist, initial);

  if (state.success) {
    return (
      <p className="waitlist-form__success" role="status">
        You’re in. I’ll write back with a time to walk a real week together —
        coffee optional, ledger included.
      </p>
    );
  }

  return (
    <form className="waitlist-form" action={action}>
      <label className="waitlist-form__field">
        <span className="waitlist-form__label">Work email</span>
        <input
          className="waitlist-form__input"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="controller@goodburger.com"
          required
        />
      </label>
      <label className="waitlist-form__field">
        <span className="waitlist-form__label">Restaurant / group</span>
        <input
          className="waitlist-form__input"
          type="text"
          name="restaurant"
          placeholder="Good Burger — 2 locations"
          required
        />
      </label>
      {state.error ? (
        <p className="waitlist-form__error" role="alert">
          {state.error}
        </p>
      ) : null}
      <Submit />
    </form>
  );
}
