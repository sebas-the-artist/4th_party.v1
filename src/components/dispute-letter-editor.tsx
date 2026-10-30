"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { resolveMatchAction, saveDisputeAction } from "@/app/(dashboard)/dashboard/actions";
import { DisputeTools } from "@/components/dispute-tools";
import { letterBlanks, stampSignature } from "@/domain/disputes";
import type { ContactProfile, Dispute, DisputeStatus } from "@/domain/types";
import { DISPUTE_STATUSES, disputeStatusLabel } from "@/domain/types";

export function DisputeLetterEditor({
  dispute,
  contact,
  businessName,
  canResolve,
}: {
  dispute: Dispute;
  contact: ContactProfile;
  businessName: string;
  canResolve: boolean;
}) {
  const [body, setBody] = useState(dispute.body);
  const [subject, setSubject] = useState(dispute.subject);
  const [toEmail, setToEmail] = useState(dispute.toEmail);

  useEffect(() => {
    setBody(dispute.body);
    setSubject(dispute.subject);
    setToEmail(dispute.toEmail);
  }, [dispute.body, dispute.subject, dispute.toEmail, dispute.updatedAt]);

  const blanks = useMemo(() => letterBlanks(body), [body]);
  const hasContact = Boolean(contact.name || contact.title || contact.phone || contact.email);

  return (
    <>
      <aside className={`letter-callout ${blanks.length ? "" : "letter-callout--ok"}`}>
        <p className="letter-callout__title">You send this. We never mail DoorDash or Uber for you.</p>
        <p className="letter-callout__text">
          Copy or open it in your mail app so it leaves from your merchant account
          email — the one on the DoorDash / Uber store, not a random Gmail if that
          is a different login. File in their portal first when they have one.
          Fill any [brackets] at the bottom before you hit send.
        </p>
        {blanks.length ? (
          <p className="letter-callout__blanks">Still blank: {blanks.join(" · ")}</p>
        ) : (
          <p className="letter-callout__text">Looks complete. Copy or open mail when you are ready.</p>
        )}
        <div className="letter-callout__actions">
          {hasContact ? (
            <button
              className="button button--ghost"
              type="button"
              onClick={() => setBody(stampSignature(body, contact, businessName))}
            >
              Fill from Settings
            </button>
          ) : (
            <Link className="button button--ghost" href="/dashboard/settings">
              Add your name in Settings
            </Link>
          )}
        </div>
      </aside>

      <form className="ingest-form" action={saveDisputeAction}>
        <input type="hidden" name="disputeId" value={dispute.id} />
        <label>
          Status
          <select name="status" defaultValue={dispute.status}>
            {DISPUTE_STATUSES.map((status: DisputeStatus) => (
              <option key={status} value={status}>
                {disputeStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <label>
          To
          <input
            name="toEmail"
            value={toEmail}
            onChange={(event) => setToEmail(event.target.value)}
            placeholder="platform support email"
          />
        </label>
        <label>
          Subject
          <input
            name="subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </label>
        <label>
          Letter
          <textarea
            name="body"
            rows={26}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>
        <div className="ingest-form__footer">
          <button className="button button--primary" type="submit">
            Save draft
          </button>
        </div>
      </form>

      <DisputeTools
        matchId={dispute.matchId}
        subject={subject}
        body={body}
        toEmail={toEmail}
        blocked={blanks.length > 0}
      />

      {canResolve ? (
        <div className="ingest-form__footer">
          <form action={resolveMatchAction}>
            <input type="hidden" name="matchId" value={dispute.matchId} />
            <input type="hidden" name="outcome" value="approved" />
            <button className="button button--primary" type="submit">
              Mark refund received
            </button>
          </form>
          <form action={resolveMatchAction}>
            <input type="hidden" name="matchId" value={dispute.matchId} />
            <input type="hidden" name="outcome" value="denied" />
            <button className="button button--ghost" type="submit">
              Refund denied
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
