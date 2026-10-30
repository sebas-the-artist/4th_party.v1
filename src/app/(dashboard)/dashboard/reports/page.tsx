import { CopyText } from "@/components/copy-text";
import { formatCents } from "@/domain/money";
import { dashboardSummary, exceptionRows, getScopedWorkspace } from "@/lib/workspace";

export default async function ReportsPage() {
  const { scoped } = await getScopedWorkspace();
  const summary = dashboardSummary(scoped);
  const exceptions = exceptionRows(scoped);
  const run = summary.latestRun;
  const subject = `${summary.locationName}: ${summary.netVariance} still with the apps`;
  const body = [
    subject,
    run
      ? `Week ${run.periodStart} → ${run.periodEnd}. ${summary.matchedRate}% of lines matched. ${summary.openExceptions} need a letter.`
      : "No week run yet.",
    ...exceptions.map((item) => `- ${item.platform}: ${item.summary} (${item.variance})`),
    `${formatCents(summary.netVarianceCents)} net variance.`,
  ].join("\n");

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Week note</p>
          <h1 className="page-header__title">What to send the owner</h1>
          <p className="page-header__text">
            A short close for the selected store. Later this is the Monday email.
          </p>
        </div>
        <CopyText text={body} label="Copy week note" />
      </header>

      <article className="note-card">
        <p className="metric-card__label">Subject</p>
        <h2 className="section__title">{subject}</h2>
        <p className="page-header__text">
          {run
            ? `Week ${run.periodStart} → ${run.periodEnd}. ${summary.matchedRate}% of lines matched. ${summary.openExceptions} need a letter.`
            : "Run a week first."}
        </p>
        <ul>
          {exceptions.map((item) => (
            <li key={item.id}>
              {item.platform}: {item.summary} ({item.variance})
            </li>
          ))}
        </ul>
        <p className="money">{formatCents(summary.netVarianceCents)} net variance.</p>
      </article>
    </section>
  );
}
