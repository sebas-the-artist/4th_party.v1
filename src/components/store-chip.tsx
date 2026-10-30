"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { selectStoreAction } from "@/app/(dashboard)/dashboard/actions";
import type { LocationCard } from "@/lib/workspace";
import { formatStoreAddress, formatStoreLine } from "@/domain/types";

export function StoreChip({
  cards,
}: {
  cards: LocationCard[];
}) {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  }, [pathname]);

  if (pathname === "/dashboard") {
    return null;
  }

  const active = cards.find((card) => card.active) ?? cards[0];
  if (!active) {
    return (
      <Link className="store-chip store-chip--empty" href="/dashboard/locations">
        Add a location
      </Link>
    );
  }

  return (
    <details ref={detailsRef} className="store-chip">
      <summary className="store-chip__summary">
        <span className="store-chip__name">{formatStoreLine(active.location)}</span>
        <span className="store-chip__caret" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="store-chip__panel">
        <p className="store-chip__title">{active.location.name}</p>
        <p className="store-chip__meta">Store #{active.location.storeNumber}</p>
        <p className="store-chip__meta">{formatStoreAddress(active.location)}</p>
        <p className="store-chip__status">{active.healthLabel}</p>
        <p className="store-chip__metrics">
          {active.openDiscrepancies} open · {active.matchedRate}% matched
        </p>
        <div className="store-chip__list">
          {cards.map((card) => (
            <form key={card.location.id} action={selectStoreAction}>
              <input type="hidden" name="locationId" value={card.location.id} />
              <button
                className={`store-chip__option ${card.active ? "store-chip__option--active" : ""}`}
                type="submit"
              >
                {formatStoreLine(card.location)}
              </button>
            </form>
          ))}
        </div>
        <Link className="button button--ghost" href="/dashboard/locations">
          Manage locations
        </Link>
      </div>
    </details>
  );
}
