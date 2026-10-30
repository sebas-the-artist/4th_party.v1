"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { selectStoreAction } from "@/app/(dashboard)/dashboard/actions";
import { formatStoreAddress, formatStoreLine } from "@/domain/types";
import type { LocationCard } from "@/lib/workspace";

export function LocationsBoard({ cards }: { cards: LocationCard[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return cards;
    return cards.filter((card) => {
      const haystack = `${card.location.name} ${card.location.storeNumber} ${formatStoreAddress(card.location)} ${card.healthLabel} ${card.platforms.join(" ")}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [cards, query]);

  return (
    <div className="locations-board">
      <label className="filter-bar__field">
        <span className="sr-only">Search locations</span>
        <input
          className="filter-bar__input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search store, number, or city"
        />
      </label>
      <div className="data-table-wrap data-table-wrap--stack">
        <table className="data-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Address</th>
              <th>Status</th>
              <th>Platforms</th>
              <th>Open</th>
              <th>Matched</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((card) => (
              <tr key={card.location.id} className={card.active ? "data-table__row--active" : ""}>
                <td data-label="Store">
                  <strong>{card.location.name}</strong>
                  <div className="attention-row__meta">{formatStoreLine(card.location)}</div>
                  {card.active ? <span className="pill">Current</span> : null}
                </td>
                <td data-label="Address">{formatStoreAddress(card.location)}</td>
                <td data-label="Status">
                  <span className={`status-badge status-badge--store-${card.health}`}>
                    {card.healthLabel}
                  </span>
                </td>
                <td data-label="Platforms">{card.platforms.join(", ") || "None connected"}</td>
                <td data-label="Open">{card.openDiscrepancies}</td>
                <td data-label="Matched">{card.matchedRate}%</td>
                <td data-label="Actions">
                  <div className="ingest-form__footer">
                    {card.active ? null : (
                      <form action={selectStoreAction}>
                        <input type="hidden" name="locationId" value={card.location.id} />
                        <button className="button button--ghost" type="submit">
                          View this store
                        </button>
                      </form>
                    )}
                    <Link className="data-table__open" href="/dashboard">
                      Overview
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="empty-state">No stores match that search.</p> : null}
      </div>
    </div>
  );
}
