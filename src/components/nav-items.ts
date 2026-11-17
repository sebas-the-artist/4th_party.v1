export type NavLeaf = {
  href: string;
  label: string;
};

export type NavGroup = {
  label: string;
  children: NavLeaf[];
};

export type NavItem = NavLeaf | NavGroup;

export const DASHBOARD_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home" },
  {
    label: "Guide",
    children: [
      { href: "/dashboard/guide", label: "Playbook" },
      { href: "/dashboard/guide/setup", label: "Setup checklist" },
    ],
  },
  {
    label: "Ledger",
    children: [
      { href: "/dashboard/reconciliations", label: "Runs" },
      { href: "/dashboard/exceptions", label: "Flags" },
      { href: "/dashboard/disputes", label: "Letters" },
      { href: "/dashboard/reconciliations/new", label: "Upload payout" },
    ],
  },
  {
    label: "Stores",
    children: [
      { href: "/dashboard/locations", label: "Stores" },
      { href: "/dashboard/integrations", label: "Feeds" },
    ],
  },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

export function navIsActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/dashboard/guide") {
    return pathname === href;
  }
  if (href === "/dashboard/reconciliations") {
    return (
      pathname === href ||
      /^\/dashboard\/reconciliations\/(?!new(?:\/|$)).+/.test(pathname)
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function navGroupIsActive(pathname: string, item: NavGroup) {
  return item.children.some((child) => navIsActive(pathname, child.href));
}
