import Link from "next/link";
import { SetupGuide } from "@/components/setup-guide";
import { StatusBadge } from "@/components/status-badge";
import { setupProgress } from "@/domain/setup";
import { platformLabel } from "@/domain/types";
import { exceptionRows, getScopedWorkspace } from "@/lib/workspace";

export default async function ExceptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const params = await searchParams;
  const { workspace, scoped, location } = await getScopedWorkspace();
  const setup = setupProgress(workspace, location);
  const platform = params.platform ?? "all";
  const exceptions = exceptionRows(scoped).filter((item) => {
    if (platform === "all") return true;
    return item.platformKey === platform;
  });

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Exceptions</p>
          <h1 className="page-header__title">Still open</h1>
          <p className="page-header__text">
            These are the ones worth a letter. Tap a row, copy or mail the
            draft, then mark refund received when the cash comes back.
          </p>
        </div>
      </header>

      <SetupGuide setup={setup} />

      <div className="chip-row" role="tablist" aria-label="Filter by platform">
        <Link
          className={`chip ${platform === "all" ? "chip--active" : ""}`}
          href="/dashboard/exceptions"
        >
          All
        </Link>
        {(["doordash", "uber_eats", "grubhub"] as const).map((key) => (
          <Link
            key={key}
            className={`chip ${platform === key ? "chip--active" : ""}`}
            href={`/dashboard/exceptions?platform=${key}`}
          >
            {platformLabel(key)}
          </Link>
        ))}
      </div>

      {exceptions.length === 0 ? (
        <p className="empty-state">
          {setup.complete
            ? "Nothing is short for that view. Enjoy the quiet."
            : "Exceptions show up after you connect feeds and run a week."}
        </p>
      ) : (
        <div className="attention-list">
          {exceptions.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/reconciliations/${item.id}`}
              className="attention-row"
            >
              <div>
                <p className="attention-row__title">
                  {item.platform} · {item.statusLabel}
                </p>
                <p className="attention-row__meta">{item.summary}</p>
              </div>
              <div>
                <p className="attention-row__amount money">{item.variance}</p>
                <StatusBadge status={item.status} recoveredCents={item.recoveredCents} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
