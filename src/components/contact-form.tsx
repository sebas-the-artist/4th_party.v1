"use client";

import { useActionState, useEffect, useState } from "react";
import { saveContactAction } from "@/app/(dashboard)/dashboard/actions";
import { signatureBlock } from "@/domain/disputes";
import type { ContactProfile } from "@/domain/types";

export function ContactForm({
  contact,
  businessName,
}: {
  contact: ContactProfile;
  businessName: string;
}) {
  const [state, action] = useActionState(saveContactAction, {});
  const [draft, setDraft] = useState(contact);

  useEffect(() => {
    setDraft(contact);
  }, [contact.name, contact.title, contact.phone, contact.email]);

  const preview = signatureBlock(draft, businessName || "[Business name]");

  return (
    <form className="ingest-form" action={action}>
      <div className="ingest-form__meta">
        <label>
          Name
          <input
            name="name"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Alex Rivera"
          />
        </label>
        <label>
          Title
          <input
            name="title"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="General manager"
          />
        </label>
      </div>
      <div className="ingest-form__meta">
        <label>
          Phone
          <input
            name="phone"
            value={draft.phone}
            onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
            placeholder="239-555-0140"
          />
        </label>
        <label>
          Merchant email
          <input
            name="email"
            type="email"
            value={draft.email}
            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            placeholder="alex@goodburger.example"
          />
        </label>
      </div>
      <p className="metric-card__label">Preview on open drafts</p>
      <pre className="dispute-body">{preview}</pre>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.saved ? (
        <p className="form-ok">Saved. Draft and ready letters now use this signature.</p>
      ) : null}
      <div className="ingest-form__footer">
        <button className="button button--primary" type="submit">
          Save contact
        </button>
      </div>
    </form>
  );
}
