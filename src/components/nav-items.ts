export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/reconciliations", label: "Reconciliations" },
  { href: "/dashboard/exceptions", label: "Exceptions" },
  { href: "/dashboard/disputes", label: "Disputes" },
  { href: "/dashboard/locations", label: "Locations" },
  { href: "/dashboard/integrations", label: "Integrations" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

export function navIsActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname.startsWith(href);
}
