import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type, space, radius } from '../theme';

export function PremiumBadge() {
  const { theme } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.accentTint }]}>
      <Text style={[type.mono, { color: theme.accentDeep }]}>PREMIUM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.md,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
});
