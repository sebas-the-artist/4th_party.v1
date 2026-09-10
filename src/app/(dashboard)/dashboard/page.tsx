import "@/styles/dashboard.css";
import Link from "next/link";
import { getDashboardSummary } from "@/lib/reconciliations";
import type { ReconciliationRow } from "@/lib/reconciliation-types";

/* import "@/styles/dashboard.css";
import Link from "next/link";
import {
  getDashboardSummary,
  type ReconciliationRow,
} from "@/lib/reconciliations";
 */
function getStatusClass(status: string) {
  switch (status) {
    case "Matched":
      return "status-pill status-pill--matched";
    case "Short deposit":
      return "status-pill status-pill--short-deposit";
    case "Error charge":
      return "status-pill status-pill--error-charge";
    case "Unmatched refund":
      return "status-pill status-pill--unmatched-refund";
    default:
      return "status-pill";
  }
}

function MetricCard({
  label,
  value,
  description,
  tone = "default",
}: {
  label: string;
  value: string | number;
  description: string;
  tone?: "default" | "danger" | "success";
}) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p className="metric-card__label">{label}</p>
      <p className="metric-card__value">{value}</p>
      <p className="metric-card__description">{description}</p>
    </article>
  );
}

function AttentionRow({ item }: { item: ReconciliationRow }) {
  return (
    <Link
      href={`/dashboard/reconciliations/${item.id}`}
      className="attention-row"
    >
      <div className="attention-row__main">
        <p className="attention-row__title">
          {item.store}
          <span>{item.platform}</span>
        </p>
        <p className="attention-row__meta">Payout ID {item.id}</p>
      </div>

      <div className="attention-row__side">
        <p className="attention-row__amount">{item.variance}</p>
        <span className={getStatusClass(item.status)}>
          {item.status}
        </span>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Overview</p>
          <h1 className="page-header__title">Payout health</h1>
          <p className="page-header__text">
            A live view of your marketplace payout reconciliation activity.
          </p>
        </div>

        <Link
          href="/dashboard/reconciliations/new"
          className="button button--primary dashboard-header-action"
        >
          + Add payout
        </Link>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Total payouts"
          value={summary.totalReconciliations}
          description="Records tracked in this workspace"
        />

        <MetricCard
          label="Open exceptions"
          value={summary.openExceptions}
          description={
            summary.openExceptions === 1
              ? "Payout needs attention"
              : "Payouts need attention"
          }
          tone={summary.openExceptions > 0 ? "danger" : "success"}
        />

        <MetricCard
          label="Unresolved variance"
          value={summary.unresolvedVariance}
          description="Total amount currently under review"
          tone={summary.openExceptions > 0 ? "danger" : "success"}
        />

        <MetricCard
          label="Matched rate"
          value={`${summary.matchedRate}%`}
          description="Payouts that have been fully reconciled"
          tone={summary.matchedRate === 100 ? "success" : "default"}
        />
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <div>
            <p className="dashboard-section__eyebrow">Priority queue</p>
            <h2 className="dashboard-section__title">Needs attention</h2>
          </div>

          <Link
            href="/dashboard/exceptions"
            className="dashboard-section__link"
          >
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>

        {summary.attentionItems.length === 0 ? (
          <article className="section-card dashboard-empty-state">
            <div className="dashboard-empty-state__icon" aria-hidden="true">
              ✓
            </div>
            <div>
              <h3 className="dashboard-empty-state__title">
                Everything is reconciled
              </h3>
              <p className="dashboard-empty-state__text">
                There are no payout exceptions waiting for review.
              </p>
            </div>
          </article>
        ) : (
          <div className="attention-list">
            {summary.attentionItems.map((item) => (
              <AttentionRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}


/* not live */
/* import "@/styles/dashboard.css";

const overviewCards = [
  {
    label: "Today variance",
    value: "-$133.60",
    note: "Across all connected platforms.",
  },
  {
    label: "Open exceptions",
    value: "3",
    note: "Items waiting on review.",
  },
  {
    label: "Connected sources",
    value: "2",
    note: "Uber Eats and DoorDash online.",
  },
];

const recentItems = [
  {
    store: "Store 014",
    platform: "DoorDash",
    issue: "Short deposit",
    amount: "-$84.20",
  },
  {
    store: "Store 009",
    platform: "Uber Eats",
    issue: "Error charge",
    amount: "-$31.40",
  },
  {
    store: "Store 022",
    platform: "DoorDash",
    issue: "Unmatched refund",
    amount: "-$18.00",
  },
];

export default function DashboardPage() {
  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Overview</p>
          <h1 className="page-header__title">Dashboard</h1>
          <p className="page-header__text">
            A quick look at payouts, exceptions, and what needs attention today.
          </p>
        </div>

        <div className="page-header__meta">
          <p className="page-header__meta-label">Updated</p>
          <p className="page-header__meta-value">Now</p>
        </div>
      </div>

      <div className="recon__summary">
        {overviewCards.map((card) => (
          <article key={card.label} className="section-card">
            <p className="detail-card__label">{card.label}</p>
            <p className="detail-card__value">{card.value}</p>
            <p className="section-card__text">{card.note}</p>
          </article>
        ))}
      </div>

      <article className="section-card">
        <h2 className="section-card__title">Recent exceptions</h2>
        <p className="section-card__text">
          The latest problem items that surfaced during reconciliation.
        </p>

        <div className="exceptions__list">
          {recentItems.map((item) => (
            <div key={`${item.store}-${item.platform}`} className="exception-card">
              <div className="exception-card__main">
                <p className="exception-card__title">
                  {item.store} • {item.platform}
                </p>
                <p className="exception-card__text">{item.issue}</p>
              </div>

              <div className="exception-card__side">
                <p className="exception-card__amount">{item.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
 */

/* boiler plate */
/* import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            let's get this shit, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
 */