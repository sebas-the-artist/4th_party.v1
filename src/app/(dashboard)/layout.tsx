import { AccountMenu } from "@/components/account-menu";
import { DashboardNav } from "@/components/dashboard-nav";
import { StoreChip } from "@/components/store-chip";
import { exitSampleAction } from "@/app/(dashboard)/dashboard/actions";
import { isSamplePreview } from "@/lib/store-context";
import { getScopedWorkspace, locationCards } from "@/lib/workspace";
import "@/styles/app.css";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const samplePreview = await isSamplePreview();
  const { workspace, location } = await getScopedWorkspace();
  const cards = locationCards(workspace, location?.id);
  const chip = <StoreChip cards={cards} />;

  return (
    <div className="app-shell">
      <DashboardNav
        accountSlot={<AccountMenu />}
        storeChip={chip}
        samplePreview={samplePreview}
      />
      <div className="app-shell__content">
        <main className="app-shell__main">
          {samplePreview ? (
            <div className="sample-banner" role="status">
              <p>
                You are in the <strong>Good Burger sample week</strong>. Your
                stores, feeds, and letters are untouched.
              </p>
              <form action={exitSampleAction}>
                <button className="button button--primary" type="submit">
                  Back to my stores
                </button>
              </form>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
