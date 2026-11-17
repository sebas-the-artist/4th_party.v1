import Link from "next/link";
import { recoveryTotals } from "@/domain/recovery";
import {
  DISPUTE_WINDOW_DAYS,
  MEMBERSHIP_ADDITIONAL_CENTS,
  MEMBERSHIP_FIRST_CENTS,
  RECOVERY_FEE_BPS,
  membershipCents,
  recoveryFeeCents,
} from "@/domain/setup";
import { formatCents } from "@/domain/money";
import { getScopedWorkspace } from "@/lib/workspace";

export default async function BillingPage() {
  const { workspace } = await getScopedWorkspace();
  const count = Math.max(
    workspace.locations.filter((location) => location.billingActive).length,
    workspace.locations.length,
  );
  const { claimed, confirmed } = recoveryTotals(workspace.matches);
  const membership = membershipCents(count);
  const recoveryFee = recoveryFeeCents(confirmed);
  const estimated = membership + recoveryFee;

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Billing</p>
          <h1 className="page-header__title">How Dishpute gets paid</h1>
          <p className="page-header__text">
            First store {formatCents(MEMBERSHIP_FIRST_CENTS)} / month. Each extra
            store {formatCents(MEMBERSHIP_ADDITIONAL_CENTS)}. Plus {RECOVERY_FEE_BPS / 100}%
            of recoveries a later payout file confirms. Stripe is not on yet.
          </p>
        </div>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <p className="metric-card__label">Stores on the account</p>
          <p className="metric-card__value">{workspace.locations.length}</p>
        </article>
        <article className="metric-card">
          <p className="metric-card__label">Membership this month</p>
          <p className="metric-card__value money">{formatCents(membership)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-card__label">Claimed by merchant</p>
          <p className="metric-card__value money">{formatCents(claimed)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-card__label">Confirmed · billable 10%</p>
          <p className="metric-card__value money">{formatCents(confirmed)}</p>
        </article>
      </div>

      <article className="note-card section">
        <p className="metric-card__label">Franchise ladder</p>
        <p className="page-header__text">
          Store 1 is {formatCents(MEMBERSHIP_FIRST_CENTS)}. Store 2, 3, 12 are{" "}
          {formatCents(MEMBERSHIP_ADDITIONAL_CENTS)} each. Adding locations should
          feel cheaper per door, not like a tax. Recovery fee stays{" "}
          {RECOVERY_FEE_BPS / 100}% of confirmed wins on every store.
        </p>
      </article>

      <article className="note-card section">
        <p className="metric-card__label">What they send vs what is live</p>
        <p className="page-header__text">
          <strong>Now, they send:</strong> the DoorDash / Uber / Grubhub payout
          or adjustments CSV as soon as the portal has it — not “once a week.”
          Platforms give about {DISPUTE_WINDOW_DAYS} days. Waiting for Sunday
          burns seven of them. POS and bank files are optional.
        </p>
        <p className="page-header__text">
          <strong>Now, we get live:</strong> nothing from the apps. No API
          tokens yet. Email forward is not wired. If they do not upload, we do
          not see the clawback.
        </p>
        <p className="page-header__text">
          <strong>Next:</strong> auto-forward of “refund issued / adjustment”
          mail so we see the take the same day. Then partner APIs (DoorDash,
          Uber, Toast, Square) and Plaid for the deposit lump. Until those
          exist, speed is “drop the file the morning it appears.”
        </p>
      </article>

      <article className="note-card section">
        <p className="metric-card__label">If they ghost us</p>
        <p className="page-header__text">
          We still get paid. Membership is the invoice —{" "}
          {formatCents(MEMBERSHIP_FIRST_CENTS)} first store,{" "}
          {formatCents(MEMBERSHIP_ADDITIONAL_CENTS)} each extra — every month
          the account is on. Bank files and “I got it back” taps are optional.
          They never gate that bill. Letters stay on as long as membership is
          current. Cancel membership, lose the workspace.
        </p>
        <p className="page-header__text">
          The 10% is extra, on top of that floor, and only when a later payout
          file proves the reversal. If they ghost uploads we miss new clawbacks
          and we miss that cut until they come back with a file — the 10%
          catches up on whatever that file confirms. We do not work for free.
          Membership is the money when they go quiet.
        </p>
      </article>

      <article className="note-card section">
        <p className="metric-card__label">Estimated this period (not billed)</p>
        <p className="page-header__text">
          Membership {formatCents(membership)} + confirmed recovery fee{" "}
          {formatCents(recoveryFee)} = <strong className="money">{formatCents(estimated)}</strong>
        </p>
        <p className="page-header__text">
          Claimed {formatCents(claimed)} is not in that number. Nobody is charged
          until Stripe is on.
        </p>
        <Link className="button button--ghost" href="/dashboard/disputes">
          Open disputes
        </Link>
      </article>
    </section>
  );
}
