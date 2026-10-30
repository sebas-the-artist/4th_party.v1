export type ColorScheme = "light" | "dark";

export type Palette = {
  id: string;
  name: string;
  light: string;
  dark: string;
  accent: string;
};

export const PALETTES: Palette[] = [
  {
    id: "harbor",
    name: "Harbor cream",
    light: "#f3eee4",
    dark: "#2c261e",
    accent: "#b45a32",
  },
  {
    id: "ledger",
    name: "Sunday ledger",
    light: "#f7f1e3",
    dark: "#1f1a14",
    accent: "#c49a3c",
  },
  {
    id: "olive",
    name: "Kitchen olive",
    light: "#eef0e4",
    dark: "#243024",
    accent: "#6b7f3a",
  },
  {
    id: "tide",
    name: "Tide pool",
    light: "#e7eef0",
    dark: "#16303a",
    accent: "#2a7d86",
  },
  {
    id: "plum",
    name: "Late plum",
    light: "#f3eaf0",
    dark: "#2b1c28",
    accent: "#8e3d6b",
  },
  {
    id: "clay",
    name: "Fired clay",
    light: "#f6ebe3",
    dark: "#3a241c",
    accent: "#c46a3a",
  },
  {
    id: "slate",
    name: "Cool slate",
    light: "#eceef1",
    dark: "#1c2228",
    accent: "#4d6d8b",
  },
  {
    id: "rose",
    name: "Rosewater",
    light: "#f6ecec",
    dark: "#321c1e",
    accent: "#b44c5a",
  },
  {
    id: "citrus",
    name: "Citrus rind",
    light: "#f4f0d8",
    dark: "#2a2814",
    accent: "#c4841c",
  },
  {
    id: "ink",
    name: "Ink well",
    light: "#e8e6e1",
    dark: "#141414",
    accent: "#3d5a80",
  },
  {
    id: "moss",
    name: "After service",
    light: "#e9eee6",
    dark: "#1c261c",
    accent: "#3f6b4e",
  },
  {
    id: "night",
    name: "Night market",
    light: "#e8e4f2",
    dark: "#1a1630",
    accent: "#d4783c",
  },
];

export const DEFAULT_PALETTE_ID = "harbor";
export const DEFAULT_SCHEME: ColorScheme = "light";
export const PALETTE_STORAGE_KEY = "4th-party-palette";
export const SCHEME_STORAGE_KEY = "4th-party-scheme";

export function getPalette(id: string | null | undefined): Palette {
  return PALETTES.find((palette) => palette.id === id) ?? PALETTES[0];
}

export function applyTheme(paletteId: string, scheme: ColorScheme) {
  const palette = getPalette(paletteId);
  const root = document.documentElement;
  root.dataset.palette = palette.id;
  root.dataset.scheme = scheme;
  root.style.setProperty("--theme-light", palette.light);
  root.style.setProperty("--theme-dark", palette.dark);
  root.style.setProperty("--theme-accent", palette.accent);
  root.style.colorScheme = scheme;
}

export const themeBootstrapScript = `(function(){
  try {
    var palettes = ${JSON.stringify(
      Object.fromEntries(
        PALETTES.map((palette) => [
          palette.id,
          { light: palette.light, dark: palette.dark, accent: palette.accent },
        ]),
      ),
    )};
    var paletteId = localStorage.getItem(${JSON.stringify(PALETTE_STORAGE_KEY)}) || ${JSON.stringify(DEFAULT_PALETTE_ID)};
    var scheme = localStorage.getItem(${JSON.stringify(SCHEME_STORAGE_KEY)}) || ${JSON.stringify(DEFAULT_SCHEME)};
    var palette = palettes[paletteId] || palettes[${JSON.stringify(DEFAULT_PALETTE_ID)}];
    var root = document.documentElement;
    root.dataset.palette = palettes[paletteId] ? paletteId : ${JSON.stringify(DEFAULT_PALETTE_ID)};
    root.dataset.scheme = scheme === "dark" ? "dark" : "light";
    root.style.setProperty("--theme-light", palette.light);
    root.style.setProperty("--theme-dark", palette.dark);
    root.style.setProperty("--theme-accent", palette.accent);
    root.style.colorScheme = root.dataset.scheme;
  } catch (error) {}
})();`;
