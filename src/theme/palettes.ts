export type ColorScheme = "light" | "dark";

export type PaletteGroup = "vision" | "animal";

export type Palette = {
  id: string;
  name: string;
  group: PaletteGroup;
  blurb: string;
  light: string;
  dark: string;
  accent: string;
};

export const PALETTES: Palette[] = [
  {
    id: "protanope",
    name: "Protanope",
    group: "vision",
    blurb:
      "Protanopia is red-green color blindness that knocks out the red cones. Reds look dark or brown, so this theme never uses red to mean money. Teal vs cream still splits paid from owed.",
    light: "#f3f1e8",
    dark: "#1c2430",
    accent: "#2f7f8e",
  },
  {
    id: "deuteranope",
    name: "Deuteranope",
    group: "vision",
    blurb:
      "Deuteranopia is the common red-green type — greens go muddy and blend into yellow. Accent is gold, not green, so a matched line and a clawback are not the same color.",
    light: "#f5f0e4",
    dark: "#241e18",
    accent: "#c48a2a",
  },
  {
    id: "tritanope",
    name: "Tritanope",
    group: "vision",
    blurb:
      "Tritanopia (sometimes written tritanomaly) is blue-yellow color blindness. Blues collapse toward green and yellows can look pink. Coral on cream keeps the page from vanishing.",
    light: "#f7f0e8",
    dark: "#2a1c18",
    accent: "#c45c3a",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    group: "vision",
    blurb:
      "Achromatopsia is near-total color blindness. Contrast, weight, and the target mark do the work. No hue to guess at.",
    light: "#ececec",
    dark: "#161616",
    accent: "#5a5a5a",
  },
  {
    id: "bee",
    name: "Bee",
    group: "animal",
    blurb:
      "Bees do not see red. A red flower often looks dark to them; they lock onto blue, green, and ultraviolet. That is why this is not the red theme.",
    light: "#eef6ea",
    dark: "#14261c",
    accent: "#2f7ad1",
  },
  {
    id: "deer",
    name: "Deer",
    group: "animal",
    blurb:
      "Deer are dichromats — mostly blue and yellow. Hunter orange works because it is bright, not because they see “orange” like we do.",
    light: "#eef2e2",
    dark: "#1c2416",
    accent: "#c9a227",
  },
  {
    id: "dog",
    name: "Dog",
    group: "animal",
    blurb:
      "Dogs mostly see blue and yellow. A red ball in green grass is just two browns. Cool slate plus a blue accent.",
    light: "#eef1f4",
    dark: "#1a2228",
    accent: "#3d6ea8",
  },
  {
    id: "bird",
    name: "Bird",
    group: "animal",
    blurb:
      "Many birds have a fourth cone for ultraviolet. Their world is louder than ours. This one is punchy on purpose.",
    light: "#f6eef6",
    dark: "#1a1430",
    accent: "#e23e8c",
  },
  {
    id: "bug",
    name: "Bug",
    group: "animal",
    blurb:
      "Insects add ultraviolet and very fast flicker. Green-gold so the UI feels like a meadow, not a steakhouse after close.",
    light: "#eaf6e8",
    dark: "#102018",
    accent: "#5aaa32",
  },
  {
    id: "fish",
    name: "Fish",
    group: "animal",
    blurb:
      "Red dies first underwater. A lot of reef life lives in blue-green, so this theme does too.",
    light: "#e6f3f4",
    dark: "#0c2430",
    accent: "#1aa6b8",
  },
];

export const PALETTE_GROUPS: { id: PaletteGroup; label: string }[] = [
  { id: "vision", label: "Color vision" },
  { id: "animal", label: "How they see it" },
];

export const DEFAULT_PALETTE_ID = "bee";
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
