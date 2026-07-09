import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { glassBlur, useTheme } from '../theme';

type Props = {
  name: React.ComponentProps<typeof Feather>['name'];
  onPress?: () => void;
};

// design.md §6 "Glass icon button" — floating control over full-bleed media (Shorts/Video).
export function GlassIconButton({ name, onPress }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={glassBlur.media} tint="dark" style={styles.blur}>
          <Feather name={name} size={18} color="#fff" />
        </BlurView>
      ) : (
        <View style={[styles.blur, { backgroundColor: theme.glassMediaFill }]}>
          <Feather name={name} size={18} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  blur: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
