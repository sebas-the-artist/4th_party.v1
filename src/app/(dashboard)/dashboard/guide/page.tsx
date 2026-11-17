import Link from "next/link";

export default function GuidePage() {
  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Guide</p>
          <h1 className="page-header__title">How to not lose the week</h1>
          <p className="page-header__text">
            Platforms give about 30 days to fight a clawback. This page is the
            short version of what you send, what we cannot see yet, and how to
            make Monday easier.
          </p>
        </div>
      </header>

      <article className="note-card section">
        <p className="metric-card__label">Start (about two minutes)</p>
        <ol className="guide-list">
          <li>
            <Link href="/dashboard/locations">Add the store</Link> — name and
            street.
          </li>
          <li>
            <Link href="/dashboard/integrations">Flip DoorDash / Uber / Grubhub</Link>{" "}
            for the apps that store actually sells on.
          </li>
          <li>
            <Link href="/dashboard/reconciliations/new">Upload the payout CSV</Link>{" "}
            the morning the merchant portal has it. Do not wait for Sunday.
          </li>
          <li>
            Keep the <Link href="/dashboard/guide/setup">setup checklist</Link>{" "}
            nearby — POS and bank stay optional.
          </li>
        </ol>
        <p className="page-header__text">
          POS tickets and bank deposits are optional. They make the letter
          stronger. They are not a gate.
        </p>
      </article>

      <article className="note-card section">
        <p className="metric-card__label">What you send, every time a file appears</p>
        <p className="page-header__text">
          The DoorDash, Uber Eats, or Grubhub payout / adjustments export. Their
          column names are fine. We look for order ID, error charge, net payout,
          description.
        </p>
        <p className="page-header__text">
          Waiting a week burns seven days of the fight window. Same-day upload
          is the whole product until APIs exist.
        </p>
      </article>

      <article className="note-card section">
        <p className="metric-card__label">What we get live today</p>
        <p className="page-header__text">
          Nothing from the apps. No API, no inbox scrape, no bank feed. If you
          do not upload, we do not see the clawback.
        </p>
        <p className="page-header__text">
          Later, in this order: auto-forward of “refund issued / adjustment”
          mail (same-day catch), then DoorDash / Uber partner APIs, then Toast /
          Square, then Plaid for the deposit lump. Email still will not prove a
          win — the next payout file does.
        </p>
      </article>

      <article className="note-card section">
        <p className="metric-card__label">Make it easier on your end</p>
        <ul className="guide-list">
          <li>Bookmark the merchant portal “payouts” or “adjustments” export.</li>
          <li>Download as CSV, not PDF or a screenshot of a dashboard.</li>
          <li>Upload as soon as the file exists — even a mid-week dump.</li>
          <li>
            Send the letter from the restaurant’s own inbox. We never mail Uber
            for you.
          </li>
          <li>
            Ignore “I think the cash came back” for billing. We only take 10%
            when a later payout file shows the reversal.
          </li>
          <li>
            Add a second store when you are ready — first door $39 / month, each
            extra $29.
          </li>
        </ul>
      </article>

      <article className="note-card section">
        <p className="metric-card__label">Where to click</p>
        <p className="page-header__text">
          <Link href="/dashboard">Home</Link> is the board.{" "}
          <Link href="/dashboard/exceptions">Flags</Link> are the ones worth a
          letter. <Link href="/dashboard/disputes">Letters</Link> are the drafts.{" "}
          <Link href="/dashboard/billing">Billing</Link> is the scoreboard, not a
          charge. Ghosting bank, taps, and uploads does not make the account
          free. Membership still bills. The 10% catches up when a later file
          proves the reversal.
        </p>
      </article>
    </section>
  );
}
