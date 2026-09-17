import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { glassBlur, radius, space, type, useTheme } from '../theme';

type Props = {
  items: readonly string[];
  active: string;
  onSelect: (item: string) => void;
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Floating glass pill buttons — GlassSheet/GlassIconButton's blur language (design.md §6) applied
// to the Home category strip instead of a flat underline tab bar. No `blurMethod`/`blurTarget`
// here (unlike GlobalTabBar/GlassSheet's `sheet` variant): this strip scrolls horizontally
// *inside* Home's vertically-scrolling feed — the exact "actively-scrolling ancestor" combination
// GlassSheet's own doc comment identifies as a real Android SIGSEGV crash trigger for the live-
// sampling blur method. Falls back to the same flat-tint BlurView GlassSheet's `card` variant
// uses for the same reason — safe everywhere, at the cost of a true live blur on Android.
//
// Bug found live: `theme.glassChromeFill` (a near-white/near-black tint) sits almost flush
// against `theme.bg` itself, so an inactive pill's fill was nearly invisible over the flat page
// background — every tab except the selected one read as bare text with no pill shape at all.
// `theme.rule` (the palette's own subtle-divider grey) has real, deliberate contrast against
// `bg` in both themes, so every pill now reads as a pill regardless of selection — only the
// *color* changes (neutral grey → accent tint) when a tab becomes active, matching
// InterestChipGrid.tsx's established active/inactive chip pattern.
export function SectionTabStrip({ items, active, onSelect }: Props) {
  const { theme, mode } = useTheme();
  const tint: 'dark' | 'light' = mode === 'dark' ? 'dark' : 'light';

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => {
        const isActive = item === active;
        return (
          <Pressable key={item} onPress={() => onSelect(item)} style={styles.pillWrap} accessibilityRole="button" accessibilityState={{ selected: isActive }}>
            <BlurView
              intensity={glassBlur.chrome}
              tint={tint}
              style={[
                styles.pill,
                { backgroundColor: isActive ? hexToRgba(theme.accent, 0.2) : hexToRgba(theme.rule, 0.7) },
              ]}
            >
              <Text style={[type.label, { color: isActive ? theme.accentDeep : theme.inkMuted }]}>{item}</Text>
            </BlurView>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: space.lg, gap: space.sm },
  pillWrap: { borderRadius: radius.pill, overflow: 'hidden' },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
});
