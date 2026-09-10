"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/reconciliations", label: "Reconciliations" },
  { href: "/dashboard/exceptions", label: "Exceptions" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard__sidebar">
      <div className="dashboard-brand">
        <p className="dashboard-brand__eyebrow">Payout app</p>
        <h1 className="dashboard-brand__title">Ledgerflow</h1>
      </div>

      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dashboard-nav__link ${
                active ? "dashboard-nav__link--active" : ""
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}



/* "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Reconciliations", href: "/dashboard/reconciliations" },
  { label: "Exceptions", href: "/dashboard/exceptions" },
  { label: "Disputes", href: "/dashboard/disputes" },
  { label: "Reports", href: "/dashboard/reports" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="sidebar">
      <div className="sidebar__brand">
        <p className="sidebar__brand-name">LedgerDock</p>
        <p className="sidebar__brand-subtext">Delivery payout reconciliation</p>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__footer-label">Workspace</p>
        <p className="sidebar__footer-value">Cape Coral Group</p>
      </div>
    </div>
  );
}
 */
