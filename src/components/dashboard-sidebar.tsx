"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { loadDemoAction } from "@/app/(dashboard)/dashboard/actions";
import { BrandMark } from "@/components/brand-mark";
import { DASHBOARD_NAV, navIsActive } from "@/components/nav-items";
import { SupportLink } from "@/components/support-link";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="side-nav" aria-label="App">
      {DASHBOARD_NAV.map((item) => {
        const active = navIsActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`side-nav__link ${active ? "side-nav__link--active" : ""}`}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Dock({ accountSlot }: { accountSlot: ReactNode }) {
  return (
    <div className="side-dock">
      <form action={loadDemoAction}>
        <button className="button button--ghost" type="submit">
          Load sample week
        </button>
      </form>
      <SupportLink compact />
      <div className="side-dock__account">{accountSlot}</div>
    </div>
  );
}

export function DashboardSidebar({
  accountSlot,
  storeChip,
}: {
  accountSlot: ReactNode;
  storeChip?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
    }
    if (!open && node.open) {
      node.close();
    }
  }, [open]);

  return (
    <div className="app-shell__nav">
      <header className="app-topbar">
        <button
          className="app-topbar__menu"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
        <Link className="side-brand side-brand--inline" href="/dashboard">
          <BrandMark />
          <span className="side-brand__name">Dishpute</span>
        </Link>
        <div className="app-topbar__chip">{storeChip}</div>
      </header>

      <aside className="app-shell__sidebar">
        <Link className="side-brand" href="/dashboard">
          <BrandMark />
          <div>
            <p className="side-brand__name">Dishpute</p>
            <p className="side-brand__meta">Delivery recon</p>
          </div>
        </Link>
        <NavLinks />
        <Dock accountSlot={accountSlot} />
      </aside>

      <dialog
        id="mobile-nav"
        ref={dialogRef}
        className="mobile-nav"
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            setOpen(false);
          }
        }}
      >
        <div className="mobile-nav__sheet">
          <div className="mobile-nav__head">
            <p id={titleId} className="side-brand__name">
              Dishpute
            </p>
            <button className="button button--ghost" type="button" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <NavLinks onNavigate={() => setOpen(false)} />
          <Dock accountSlot={accountSlot} />
        </div>
      </dialog>
    </div>
  );
}
