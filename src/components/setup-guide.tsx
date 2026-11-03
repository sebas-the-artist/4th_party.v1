import Link from "next/link";
import type { SetupProgress } from "@/domain/setup";

export function SetupGuide({ setup }: { setup: SetupProgress }) {
  if (setup.complete) {
    return null;
  }

  const next = setup.next;

  return (
    <aside className="setup-guide">
      <p className="setup-guide__kicker">Getting paid back</p>
      <h2 className="setup-guide__title">
        {next ? next.title : "You are set up"}
      </h2>
      <p className="setup-guide__text">
        {next?.hint ?? "Run a week whenever the payouts land."} Dishpute only
        finds money after POS, an app, and the bank are on — then you send the
        letter from your inbox.
      </p>
      <ol className="setup-guide__steps">
        {setup.steps.map((step, index) => (
          <li
            key={step.id}
            className={`setup-guide__step ${step.done ? "setup-guide__step--done" : ""} ${next?.id === step.id ? "setup-guide__step--next" : ""}`}
          >
            <span className="setup-guide__index">{step.done ? "✓" : index + 1}</span>
            <div>
              <p className="setup-guide__step-title">{step.title}</p>
              <p className="setup-guide__step-hint">{step.hint}</p>
            </div>
          </li>
        ))}
      </ol>
      {next ? (
        <Link className="button button--primary" href={next.href}>
          {next.cta}
        </Link>
      ) : null}
    </aside>
  );
}
