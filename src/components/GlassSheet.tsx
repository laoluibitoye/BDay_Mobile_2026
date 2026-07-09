import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { elevation, glassBlur, radius, useTheme } from '../theme';

type Props = {
  children: React.ReactNode;
  variant?: 'sheet' | 'card';
  style?: ViewStyle;
};

// Glass surface reused for bottom-sheet modals (Paywall, Gift-article) and prominent inline CTA
// cards (the article reader's paywall teaser) — matches the floating tab bar's blur treatment
// instead of a flat warm `bgPaper` fill, so "this is a different kind of surface" reads as
// glass/chrome, not sepia-tinted paper. `sheet` rounds only the top corners (bottom-anchored
// modal); `card` rounds all four (inline card sitting in a scroll view).
export function GlassSheet({ children, variant = 'sheet', style }: Props) {
  const { theme, mode } = useTheme();
  const cornerRadius = variant === 'sheet' ? radius.card * 2 : radius.card;
  const shape: ViewStyle =
    variant === 'sheet'
      ? { borderTopLeftRadius: cornerRadius, borderTopRightRadius: cornerRadius }
      : { borderRadius: cornerRadius };

  const Wrapper = Platform.OS === 'ios' ? BlurView : View;
  const wrapperProps =
    Platform.OS === 'ios'
      ? { intensity: glassBlur.chrome, tint: (mode === 'dark' ? 'dark' : 'light') as 'dark' | 'light' }
      : {};

  return (
    <View style={[shape, elevation.raised]}>
      <Wrapper
        {...wrapperProps}
        style={[shape, styles.base, { borderColor: theme.glassChromeBorder, backgroundColor: theme.glassChromeFill }, style]}
      >
        {children}
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, overflow: 'hidden' },
});
