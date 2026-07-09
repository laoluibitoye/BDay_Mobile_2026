import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type, space } from '../theme';

export function PremiumBadge() {
  const { theme } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.accentTint }]}>
      <Text style={[type.mono, { color: theme.accentDeep }]}>PREMIUM</Text>
    </View>
  );
}

export function LiveBadge() {
  const { theme } = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: theme.accent }]}>
      <View style={styles.dot} />
      <Text style={[type.mono, { color: '#fff' }]}>LIVE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.md,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
});
