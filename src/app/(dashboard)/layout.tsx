import "@/styles/dashboard.css";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <DashboardSidebar />

      <main className="dashboard__main">
        <div className="dashboard__content">{children}</div>
      </main>
    </div>
  );
}



/* import type { ReactNode } from "react";
import "@/styles/dashboard.css";

import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardTopbar from "@/components/dashboard-topbar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="dashboard">
      <aside className="dashboard__sidebar">
        <DashboardSidebar />
      </aside>

      <div className="dashboard__main">
        <DashboardTopbar />

        <main className="dashboard__content">{children}</main>
      </div>
    </div>
  );
}
 */
/**/
/*boiler plate code*/
