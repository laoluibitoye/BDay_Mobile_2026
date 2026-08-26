import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { radius, space, type, useTheme } from '../theme';

const NEON_RED = '#FF1A1A';

// No live market-data feed exists yet — this used to scroll a marquee of fabricated
// prices/percentage changes, which reads as real financial data even though nothing backs it.
// An honest strip pointing at Markets (itself an empty state until a real feed exists) instead.
export function MarketTickerStrip() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable
      onPress={() => navigation.navigate('Markets')}
      accessibilityRole="button"
      accessibilityLabel="Open Markets"
      style={[styles.wrap, { backgroundColor: theme.bgCard, borderColor: theme.rule }]}
    >
      <View style={[styles.marketsButton, { backgroundColor: NEON_RED }]}>
        <Feather name="trending-up" size={14} color="#FFFFFF" />
        <Text style={[type.mono, { color: '#FFFFFF' }]}>MKTS</Text>
      </View>
      <Text style={[type.caption, { color: theme.inkMuted, marginLeft: space.md }]}>
        Live market data is coming soon
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  marketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
  },
});
