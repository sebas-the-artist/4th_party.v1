"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import {
  applyTheme,
  DEFAULT_PALETTE_ID,
  DEFAULT_SCHEME,
  PALETTES,
  PALETTE_GROUPS,
  PALETTE_STORAGE_KEY,
  SCHEME_STORAGE_KEY,
  type ColorScheme,
} from "@/theme/palettes";

function readStoredTheme() {
  if (typeof document === "undefined") {
    return { paletteId: DEFAULT_PALETTE_ID, scheme: DEFAULT_SCHEME };
  }
  return {
    paletteId: document.documentElement.dataset.palette || DEFAULT_PALETTE_ID,
    scheme: (document.documentElement.dataset.scheme === "dark"
      ? "dark"
      : "light") as ColorScheme,
  };
}

export function ThemeControls({ variant }: { variant: "dock" | "panel" }) {
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE_ID);
  const [scheme, setScheme] = useState<ColorScheme>(DEFAULT_SCHEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    setPaletteId(stored.paletteId);
    setScheme(stored.scheme);
    setReady(true);
  }, []);

  function persist(nextPalette: string, nextScheme: ColorScheme) {
    setPaletteId(nextPalette);
    setScheme(nextScheme);
    applyTheme(nextPalette, nextScheme);
    localStorage.setItem(PALETTE_STORAGE_KEY, nextPalette);
    localStorage.setItem(SCHEME_STORAGE_KEY, nextScheme);
  }

  const selected = PALETTES.find((palette) => palette.id === paletteId) ?? PALETTES[0];

  if (!ready) {
    return <div className={`theme-controls theme-controls--${variant}`} />;
  }

  return (
    <div className={`theme-controls theme-controls--${variant}`}>
      <div className="theme-controls__schemes">
        <button
          type="button"
          className={`theme-controls__scheme ${scheme === "light" ? "theme-controls__scheme--active" : ""}`}
          aria-pressed={scheme === "light"}
          onClick={() => persist(paletteId, "light")}
        >
          Light
        </button>
        <button
          type="button"
          className={`theme-controls__scheme ${scheme === "dark" ? "theme-controls__scheme--active" : ""}`}
          aria-pressed={scheme === "dark"}
          onClick={() => persist(paletteId, "dark")}
        >
          Dark
        </button>
      </div>

      {PALETTE_GROUPS.map((group) => (
        <div key={group.id} className="theme-controls__group">
          <p className="theme-controls__group-label">{group.label}</p>
          <div className="theme-controls__swatches" role="radiogroup" aria-label={group.label}>
            {PALETTES.filter((palette) => palette.group === group.id).map((palette) => {
              const isSelected = palette.id === paletteId;
              return (
                <button
                  key={palette.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={palette.name}
                  title={palette.name}
                  className={`theme-swatch ${isSelected ? "theme-swatch--active" : ""}`}
                  style={{
                    ["--accent" as string]: palette.accent,
                    ["--swatch-ink" as string]: palette.dark,
                    ["--theme-light" as string]: palette.light,
                  }}
                  onClick={() => persist(palette.id, scheme)}
                >
                  <BrandMark />
                  <span className="theme-swatch__name">{palette.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selected ? (
        <p className="theme-controls__blurb">
          <strong>{selected.name}.</strong> {selected.blurb}
        </p>
      ) : null}
    </div>
  );
}
