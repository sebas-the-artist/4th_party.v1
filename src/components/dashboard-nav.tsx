"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { exitSampleAction, loadDemoAction } from "@/app/(dashboard)/dashboard/actions";
import { BrandLogo } from "@/components/brand-logo";
import {
  DASHBOARD_NAV,
  isNavGroup,
  navGroupIsActive,
  navIsActive,
} from "@/components/nav-items";
import { SupportLink } from "@/components/support-link";

function NavLinks({
  className,
  onNavigate,
}: {
  className: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    navRef.current?.querySelectorAll("details[open]").forEach((node) => {
      node.removeAttribute("open");
    });
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        navRef.current?.querySelectorAll("details[open]").forEach((node) => {
          node.removeAttribute("open");
        });
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <nav ref={navRef} className={className} aria-label="App">
      {DASHBOARD_NAV.map((item) => {
        if (!isNavGroup(item)) {
          const active = navIsActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`top-nav__link ${active ? "top-nav__link--active" : ""}`}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          );
        }

        const active = navGroupIsActive(pathname, item);
        return (
          <details
            key={item.label}
            className={`top-nav__menu ${active ? "top-nav__menu--active" : ""}`}
            onToggle={(event) => {
              if (!event.currentTarget.open) {
                return;
              }
              navRef.current?.querySelectorAll("details[open]").forEach((node) => {
                if (node !== event.currentTarget) {
                  node.removeAttribute("open");
                }
              });
            }}
          >
            <summary className="top-nav__summary">
              {item.label}
              <span aria-hidden>▾</span>
            </summary>
            <div className="top-nav__panel">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`top-nav__sublink ${navIsActive(pathname, child.href) ? "top-nav__sublink--active" : ""}`}
                  onClick={onNavigate}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </details>
        );
      })}
    </nav>
  );
}

function BrandLockup() {
  return (
    <Link className="side-brand side-brand--inline" href="/dashboard">
      <BrandLogo />
      <div>
        <p className="side-brand__name">Dishpute</p>
        <p className="side-brand__meta">Protect What&apos;s Yours</p>
      </div>
    </Link>
  );
}

function SampleControl({ samplePreview }: { samplePreview: boolean }) {
  if (samplePreview) {
    return (
      <form action={exitSampleAction}>
        <button className="button button--primary" type="submit">
          Back to my stores
        </button>
      </form>
    );
  }

  return (
    <form
      action={loadDemoAction}
      onSubmit={(event) => {
        const ok = window.confirm(
          "Open the Good Burger sample week? Your stores and files stay as they are. Come back with Back to my stores.",
        );
        if (!ok) {
          event.preventDefault();
        }
      }}
    >
      <button className="button button--ghost" type="submit">
        Try sample week
      </button>
    </form>
  );
}

export function DashboardNav({
  accountSlot,
  storeChip,
  samplePreview = false,
  showSample = true,
}: {
  accountSlot: ReactNode;
  storeChip?: ReactNode;
  samplePreview?: boolean;
  showSample?: boolean;
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
    <div className="app-chrome-wrap">
      <header className="app-chrome">
        <div className="app-chrome__row">
          <button
            className="app-chrome__menu"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <BrandLockup />
          <div className="app-chrome__end">
            <div className="app-chrome__chip">{storeChip}</div>
            <div className="app-chrome__help">
              <SupportLink compact />
            </div>
            <div className="app-chrome__account">{accountSlot}</div>
          </div>
        </div>
        <NavLinks className="top-nav top-nav--desktop" />
      </header>
      {showSample ? (
        <div className="app-chrome__under">
          <SampleControl samplePreview={samplePreview} />
        </div>
      ) : null}

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
            <div id={titleId} className="side-brand side-brand--inline">
              <BrandLogo />
              <div>
                <p className="side-brand__name">Dishpute</p>
                <p className="side-brand__meta">Protect What&apos;s Yours</p>
              </div>
            </div>
            <button className="button button--ghost" type="button" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <NavLinks className="top-nav top-nav--sheet" onNavigate={() => setOpen(false)} />
          <div className="side-dock">
            {showSample ? <SampleControl samplePreview={samplePreview} /> : null}
            <SupportLink compact />
            <div className="side-dock__account">{accountSlot}</div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
