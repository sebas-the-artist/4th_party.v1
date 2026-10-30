import Link from "next/link";
import { DisputeBadge } from "@/components/dispute-badge";
import { DisputeTools } from "@/components/dispute-tools";
import { hasLetterBlanks } from "@/domain/disputes";
import { formatCents } from "@/domain/money";
import { getScopedWorkspace } from "@/lib/workspace";

export default async function DisputesPage() {
  const { scoped } = await getScopedWorkspace();
  const rows = scoped.disputes
    .map((dispute) => {
      const match = scoped.matches.find((item) => item.id === dispute.matchId);
      return { dispute, match };
    })
    .filter((row) => row.match);

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Disputes</p>
          <h1 className="page-header__title">Letters for this store</h1>
          <p className="page-header__text">
            Review the draft, copy or open it in your mail app, then mark refund
            received when the platform makes you whole. Mail always leaves from
            you. We do not send to DoorDash or Uber.
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="empty-state">No dispute drafts for this store.</p>
      ) : (
        <div className="dispute-list">
          {rows.map(({ dispute, match }) => (
            <article key={dispute.id} className="dispute-card">
              <div>
                <p className="dispute-card__title">{dispute.subject || match?.summary}</p>
                <p className="dispute-card__meta">
                  {match ? `${formatCents(Math.abs(match.varianceCents || match.recoveredCents))} in question` : null}
                </p>
                <DisputeBadge status={dispute.status} />
                <pre className="dispute-body">{dispute.body}</pre>
                {match && match.status !== "matched" ? (
                  <DisputeTools
                    matchId={match.id}
                    subject={dispute.subject}
                    body={dispute.body}
                    toEmail={dispute.toEmail}
                    blocked={hasLetterBlanks(dispute.body)}
                  />
                ) : null}
                <div className="ingest-form__footer">
                  <Link className="button button--primary" href={`/dashboard/disputes/${dispute.id}`}>
                    Review and edit
                  </Link>
                  {match ? (
                    <Link className="button button--ghost" href={`/dashboard/reconciliations/${match.id}`}>
                      Open line
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
