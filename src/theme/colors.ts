// Source of truth: /design.md §2 Color system — official BusinessDay Mobile App UI/UX Palette
export const brand = {
  ink900: '#111111',
  gray700: '#333333',
  redBright: '#FF4516',
  red500: '#F73200',
  gray200: '#DDE1E6',
  neutral50: '#F8F9FA',
} as const;

export type Theme = {
  ink: string;
  inkMuted: string;
  inkFaint: string;
  bg: string;
  bgPaper: string;
  bgCard: string;
  rule: string;
  accent: string;
  accentDeep: string;
  accentTint: string;
  marketUp: string;
  marketDown: string;
  white: string;
  glassChromeFill: string;
  glassChromeBorder: string;
  glassMediaFill: string;
};

export const lightTheme: Theme = {
  ink: brand.ink900,
  inkMuted: brand.gray700,
  inkFaint: '#8A8A8E', // derived — design.md §2.5
  bg: brand.neutral50,
  bgPaper: '#F4ECDD', // derived, sepia/reading-mode utility only — design.md §2.5
  bgCard: '#FFFFFF',
  rule: brand.gray200,
  accent: brand.red500,
  accentDeep: '#B22800', // derived, small-text-safe accent — design.md §2.5
  accentTint: '#FCE0D9', // derived
  marketUp: '#1E7F4C', // derived — no green in the official palette
  marketDown: '#B22800',
  white: '#FFFFFF',
  glassChromeFill: 'rgba(248,249,250,0.72)',
  glassChromeBorder: 'rgba(17,17,17,0.08)',
  glassMediaFill: 'rgba(17,17,17,0.45)',
};

export const darkTheme: Theme = {
  ink: brand.neutral50,
  inkMuted: brand.gray200,
  inkFaint: '#77797D', // derived
  bg: brand.ink900,
  bgPaper: '#1C1712', // derived, sepia/reading-mode utility only
  bgCard: brand.gray700,
  rule: '#2A2A2A', // derived
  accent: brand.redBright,
  accentDeep: brand.red500,
  accentTint: '#3A160D', // derived
  marketUp: '#3FA871', // derived
  marketDown: brand.redBright,
  white: '#FFFFFF',
  glassChromeFill: 'rgba(51,51,51,0.72)',
  glassChromeBorder: 'rgba(248,249,250,0.10)',
  glassMediaFill: 'rgba(17,17,17,0.45)',
};
