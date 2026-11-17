import { SetupGuide } from "@/components/setup-guide";
import { setupProgress } from "@/domain/setup";
import { getScopedWorkspace } from "@/lib/workspace";

export default async function SetupChecklistPage() {
  const { workspace, location } = await getScopedWorkspace();
  const setup = setupProgress(workspace, location);

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Guide</p>
          <h1 className="page-header__title">Setup checklist</h1>
          <p className="page-header__text">
            Check marks stay here even after you start running files. POS and
            bank never block billing or letters.
          </p>
        </div>
      </header>
      <SetupGuide setup={setup} persist />
    </section>
  );
}
