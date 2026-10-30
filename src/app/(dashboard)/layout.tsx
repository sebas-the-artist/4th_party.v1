import { AccountMenu } from "@/components/account-menu";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { StoreChip } from "@/components/store-chip";
import { getScopedWorkspace, locationCards } from "@/lib/workspace";
import "@/styles/app.css";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { workspace, location } = await getScopedWorkspace();
  const cards = locationCards(workspace, location?.id);

  const chip = <StoreChip cards={cards} />;

  return (
    <div className="app-shell">
      <DashboardSidebar accountSlot={<AccountMenu />} storeChip={chip} />
      <div className="app-shell__content">
        <div className="app-shell__context">{chip}</div>
        <main className="app-shell__main">{children}</main>
      </div>
    </div>
  );
}
