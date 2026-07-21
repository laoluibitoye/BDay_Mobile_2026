import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { glassBlur, layout } from '../theme';
import { useBlurTarget } from './BlurTargetContext';

type Props = {
  name: React.ComponentProps<typeof Feather>['name'];
  onPress?: () => void;
  accessibilityLabel?: string;
};

// design.md §6 "Glass icon button" — floating control over full-bleed media (Shorts/Video).
export function GlassIconButton({ name, onPress, accessibilityLabel }: Props) {
  const blurTarget = useBlurTarget();
  const hitSlop = (layout.touchTarget - 40) / 2;
  // See `GlobalTabBar` for why Android needs `blurMethod` + `blurTarget` for a real blur instead
  // of the flat-tint fallback `BlurView` otherwise renders there.
  const wrapperProps =
    Platform.OS === 'android'
      ? { blurMethod: 'dimezisBlurViewSdk31Plus' as const, blurTarget, intensity: glassBlur.media, tint: 'dark' as const }
      : { intensity: glassBlur.media, tint: 'dark' as const };
  return (
    <Pressable
      onPress={onPress}
      style={styles.wrap}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? name}
    >
      <BlurView {...wrapperProps} style={styles.blur}>
        <Feather name={name} size={18} color="#fff" />
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  blur: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
