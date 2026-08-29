// Source of truth: /design.md §3 Typography system
export const fontFamily = {
  headline: 'LibreBaskerville_700Bold',
  headlineRegular: 'LibreBaskerville_400Regular',
  headlineItalic: 'LibreBaskerville_400Regular_Italic',
  body: 'Merriweather_400Regular',
  bodyBold: 'Merriweather_700Bold',
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemibold: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
  mono: 'IBMPlexMono_500Medium',
} as const;

export const type = {
  displayHeadline: { fontFamily: fontFamily.headline, fontSize: 32, lineHeight: 38 },
  articleHeadline: { fontFamily: fontFamily.headline, fontSize: 26, lineHeight: 32 },
  sectionHeadline: { fontFamily: fontFamily.headline, fontSize: 20, lineHeight: 26 },
  bodyReading: { fontFamily: fontFamily.body, fontSize: 17, lineHeight: 28 },
  bodyUI: { fontFamily: fontFamily.ui, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fontFamily.uiSemibold, fontSize: 14, lineHeight: 20 },
  // For multi-up article tiles (BriefCarouselRail, TileGridRow) — bigger/bolder/looser-tracked
  // than `label` so a title doesn't read as cramped when several tiles sit side by side.
  cardTitle: { fontFamily: fontFamily.uiBold, fontSize: 16, lineHeight: 21, letterSpacing: 0.2 },
  caption: { fontFamily: fontFamily.uiMedium, fontSize: 12, lineHeight: 16 },
  mono: { fontFamily: fontFamily.mono, fontSize: 11, lineHeight: 16, letterSpacing: 0.4 },
} as const;
