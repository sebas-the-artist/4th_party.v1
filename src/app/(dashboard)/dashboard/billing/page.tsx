import Link from "next/link";
import {
  MEMBERSHIP_CENTS_PER_LOCATION,
  RECOVERY_FEE_BPS,
  membershipCents,
  recoveryFeeCents,
} from "@/domain/setup";
import { formatCents } from "@/domain/money";
import { getScopedWorkspace } from "@/lib/workspace";

export default async function BillingPage() {
  const { workspace } = await getScopedWorkspace();
  const activeLocations = workspace.locations.filter((location) => location.billingActive);
  const recoveredCents = workspace.matches.reduce((sum, match) => sum + match.recoveredCents, 0);
  const membership = membershipCents(Math.max(activeLocations.length, workspace.locations.length));
  const recoveryFee = recoveryFeeCents(recoveredCents);
  const estimated = membership + recoveryFee;

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Billing</p>
          <h1 className="page-header__title">How Dishpute gets paid</h1>
          <p className="page-header__text">
            Nothing is charged yet. When Stripe is on, you pay a membership per
            store plus a cut of money you actually recovered — not of the
            variance we flagged.
          </p>
        </div>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <p className="metric-card__label">Stores on the account</p>
          <p className="metric-card__value">{workspace.locations.length}</p>
        </article>
        <article className="metric-card">
          <p className="metric-card__label">Membership / month</p>
          <p className="metric-card__value money">
            {formatCents(MEMBERSHIP_CENTS_PER_LOCATION)}
            <span className="attention-row__meta"> / store</span>
          </p>
        </article>
        <article className="metric-card">
          <p className="metric-card__label">Recovery fee</p>
          <p className="metric-card__value">{RECOVERY_FEE_BPS / 100}%</p>
        </article>
        <article className="metric-card">
          <p className="metric-card__label">Marked recovered</p>
          <p className="metric-card__value money">{formatCents(recoveredCents)}</p>
        </article>
      </div>

      <article className="note-card section">
        <p className="metric-card__label">How we know you got paid</p>
        <p className="page-header__text">
          We do not scrape Uber or DoorDash. You send the letter from your
          merchant inbox. When the cash shows up, you tap{" "}
          <strong>Mark refund received</strong> on that line. That is the only
          signal we bill the {RECOVERY_FEE_BPS / 100}% against. If they deny it,
          you tap refund denied — fee is $0 on that line.
        </p>
      </article>

      <article className="note-card section">
        <p className="metric-card__label">Estimated this period (not billed)</p>
        <p className="page-header__text">
          Membership {formatCents(membership)} + recovery fee{" "}
          {formatCents(recoveryFee)} = <strong className="money">{formatCents(estimated)}</strong>
        </p>
        <p className="page-header__text">
          Stripe is not connected. Nobody is charged. This page is the scoreboard
          so you can see the model before money moves.
        </p>
        <Link className="button button--ghost" href="/dashboard/disputes">
          Open disputes
        </Link>
      </article>
    </section>
  );
}
