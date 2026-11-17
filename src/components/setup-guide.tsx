import Link from "next/link";
import type { SetupProgress } from "@/domain/setup";

export function SetupGuide({
  setup,
  variant = "full",
  persist = false,
}: {
  setup: SetupProgress;
  variant?: "full" | "compact";
  persist?: boolean;
}) {
  if (setup.complete && !persist) {
    return null;
  }

  const next = setup.next ?? setup.steps.find((step) => !step.done);

  if (variant === "compact") {
    if (!next) {
      return null;
    }
    return (
      <aside className="setup-guide setup-guide--compact">
        <div>
          <p className="setup-guide__kicker">Next step</p>
          <p className="setup-guide__title">{next.title}</p>
          <p className="setup-guide__text">{next.hint}</p>
        </div>
        <Link className="button button--primary" href={next.href}>
          {next.cta}
        </Link>
      </aside>
    );
  }

  return (
    <aside className="setup-guide">
      <p className="setup-guide__kicker">Getting paid back</p>
      <h2 className="setup-guide__title">
        {next ? next.title : "Required steps are done"}
      </h2>
      <p className="setup-guide__text">
        {next
          ? `${next.hint} Store plus one app is enough to start. POS and bank make the letter stronger — they are not a gate.`
          : "Store, app, and a payout file are on. POS and bank are still optional. Membership still bills even if those stay off."}
      </p>
      <ol className="setup-guide__steps">
        {setup.steps.map((step, index) => (
          <li
            key={step.id}
            className={`setup-guide__step ${step.done ? "setup-guide__step--done" : ""} ${next?.id === step.id ? "setup-guide__step--next" : ""}`}
          >
            <span className="setup-guide__index">{step.done ? "✓" : index + 1}</span>
            <div>
              <p className="setup-guide__step-title">
                {step.title}
                {step.optional ? <span className="setup-guide__optional"> Optional</span> : null}
              </p>
              <p className="setup-guide__step-hint">{step.hint}</p>
            </div>
          </li>
        ))}
      </ol>
      {next ? (
        <Link className="button button--primary" href={next.href}>
          {next.cta}
        </Link>
      ) : (
        <Link className="button button--ghost" href="/dashboard/reconciliations/new">
          Upload another payout
        </Link>
      )}
    </aside>
  );
}
