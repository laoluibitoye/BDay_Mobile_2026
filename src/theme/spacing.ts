// Source of truth: /design.md §4 Layout & spacing
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48, huge: 64 } as const;

// EXPERIMENT (branch: experiment/uiux-overhaul) — flat, corporate treatment per tester feedback:
// card radius flattened to square, "raised" neutralized to match "resting" (border only, no
// shadow) so nothing in the app casts a card shadow. Revert to 12/shadowed values if this
// experiment doesn't stick — see design.md §4 for the original spec this diverges from.
export const radius = { button: 8, card: 0, pill: 999 } as const;

export const elevation = {
  resting: { borderWidth: 1 },
  raised: { borderWidth: 1 },
} as const;

// expo-blur `intensity` values (0-100 platform scale), not CSS px blur radii — see design.md §4.1.
export const glassBlur = { chrome: 50, media: 40 } as const;

// Semantic spacing tokens — see design.md §4.2. Use `space.*` for internal component
// geometry; use `layout.*` for cross-component rhythm decisions (module boundaries,
// card-tier padding, touch targets) so those stay named and auditable.
export const layout = {
  sectionGap: space.xxl, // 32 — gap between distinct feed modules
  heroCardPadding: space.xl, // 24 — internal padding for hero-tier cards only
  chipGap: space.md, // 12 — gap between selectable chips (was space.sm)
  chipPaddingV: space.md, // 12 — vertical chip padding (was space.sm)
  touchTarget: 44, // minimum interactive hit area, design.md §8
} as const;
