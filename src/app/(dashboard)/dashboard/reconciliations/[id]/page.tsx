import Link from "next/link";
import { resolveMatchAction } from "@/app/(dashboard)/dashboard/actions";
import { DisputeTools } from "@/components/dispute-tools";
import { StatusBadge } from "@/components/status-badge";
import { WinBurst } from "@/components/win-burst";
import { hasLetterBlanks } from "@/domain/disputes";
import { formatCents } from "@/domain/money";
import { formatStoreLine, platformLabel } from "@/domain/types";
import { getMatchDetail, getWorkspace } from "@/lib/workspace";
import { notFound } from "next/navigation";

export default async function MatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ recovered?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const workspace = await getWorkspace();
  const detail = getMatchDetail(workspace, id);

  if (!detail) {
    notFound();
  }

  const { match, location, pos, delivery, deposit, dispute } = detail;
  const recovered = Number(query.recovered ?? 0);

  return (
    <section>
      {recovered > 0 ? <WinBurst recoveredCents={recovered} /> : null}
      <Link className="page-back" href="/dashboard/reconciliations">
        ← Reconciliations
      </Link>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">{location ? formatStoreLine(location) : "Store"}</p>
          <h1 className="page-header__title">{platformLabel(match.platform)}</h1>
          <p className="page-header__text">{match.summary}</p>
        </div>
        <StatusBadge status={match.status} recoveredCents={match.recoveredCents} />
      </header>

      {match.recoveredCents > 0 ? (
        <p className="win-note">Refund received. {formatCents(match.recoveredCents)} recovered.</p>
      ) : null}

      <div className="detail-grid">
        <article className="detail-card">
          <p className="metric-card__label">Expected</p>
          <p className="metric-card__value money">{formatCents(match.expectedCents)}</p>
        </article>
        <article className="detail-card">
          <p className="metric-card__label">Received</p>
          <p className="metric-card__value money">{formatCents(match.receivedCents)}</p>
        </article>
        <article className="detail-card">
          <p className="metric-card__label">Variance</p>
          <p className={`metric-card__value money ${match.status === "matched" ? "" : "detail-card__value--alert"}`}>
            {formatCents(match.varianceCents)}
          </p>
        </article>
      </div>

      <section className="section detail-grid">
        <article className="detail-card">
          <p className="metric-card__label">POS</p>
          <p>{pos ? `${pos.ticketId} · ${formatCents(pos.grossCents)} · ${pos.status}` : "No ticket"}</p>
        </article>
        <article className="detail-card">
          <p className="metric-card__label">Delivery</p>
          <p>
            {delivery
              ? `${delivery.orderId} · net ${formatCents(delivery.netCents)} · ${delivery.status}`
              : "No payout line"}
          </p>
        </article>
        <article className="detail-card">
          <p className="metric-card__label">Bank</p>
          <p>
            {deposit
              ? `${deposit.memo} · ${formatCents(deposit.amountCents)} · ${deposit.maskedAccount}`
              : "Not a deposit line"}
          </p>
        </article>
      </section>

      {dispute ? (
        <article className="note-card section">
          <p className="metric-card__label">Dispute draft</p>
          <pre className="dispute-body">{dispute.body}</pre>
          {match.status !== "matched" ? (
            <>
              <DisputeTools
                matchId={match.id}
                subject={dispute.subject}
                body={dispute.body}
                toEmail={dispute.toEmail}
                blocked={hasLetterBlanks(dispute.body)}
              />
              <div className="ingest-form__footer">
                <Link className="button button--ghost" href={`/dashboard/disputes/${dispute.id}`}>
                  Edit draft
                </Link>
                <form action={resolveMatchAction}>
                  <input type="hidden" name="matchId" value={match.id} />
                  <input type="hidden" name="outcome" value="approved" />
                  <button className="button button--primary" type="submit">
                    Mark refund received
                  </button>
                </form>
                <form action={resolveMatchAction}>
                  <input type="hidden" name="matchId" value={match.id} />
                  <input type="hidden" name="outcome" value="denied" />
                  <button className="button button--ghost" type="submit">
                    Refund denied
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
