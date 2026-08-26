import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { getMarketPulse, type MarketPulseItem } from '../lib/api/marketPulse';
import { radius, space, type, useTheme } from '../theme';

const PIXELS_PER_SECOND = 32;
const NEON_RED = '#FF1A1A';

function useRipple(delayMs: number) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.timing(value, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [value, delayMs]);
  return value;
}

// Real, admin-edited Market Pulse figures (Appearance → BusinessDay Theme → Market Pulse) — the
// same data the website's own ticker shows, fetched via businessday-app-connector's
// /market-pulse route. Renders nothing (not even the MKTS button) if the fetch fails or nothing's
// configured yet — no fabricated placeholder figures.
export function MarketTickerStrip() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<MarketPulseItem[] | null>(null);
  const [setWidth, setSetWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const ripple1 = useRipple(0);
  const ripple2 = useRipple(900);

  useEffect(() => {
    getMarketPulse()
      .then((res) => setItems(res.items))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    if (!setWidth) return;
    translateX.setValue(0);
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -setWidth,
        duration: (setWidth / PIXELS_PER_SECOND) * 1000,
        useNativeDriver: true,
        isInteraction: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [setWidth, translateX]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  if (items === null || items.length === 0) return null;

  const openSymbol = (id: string) => {
    navigation.navigate('Markets');
    navigation.navigate('MarketDetail', { symbol: id });
  };

  const renderSet = (keySuffix: string, onLayout?: (width: number) => void) => (
    <View
      style={styles.row}
      onLayout={onLayout ? (e) => onLayout(e.nativeEvent.layout.width) : undefined}
    >
      {items.map((q) => {
        const isPercent = q.note_type === 'percent';
        const up = isPercent && !q.note.trim().startsWith('-');
        const color = isPercent ? (up ? theme.marketUp : theme.marketDown) : theme.inkMuted;
        return (
          <Pressable
            key={`${q.id}-${keySuffix}`}
            style={styles.item}
            onPress={() => openSymbol(q.id)}
            accessibilityRole="button"
            accessibilityLabel={`${q.label}, ${q.value}${q.note ? `, ${q.note}` : ''}`}
          >
            <Text style={[type.mono, { color: theme.inkMuted }]}>{q.label}</Text>
            <Text style={[type.mono, { color: theme.ink }]}>{q.value}</Text>
            {!!q.note && (
              <Text style={[type.mono, { color }]}>
                {isPercent ? (up ? '▲ ' : '▼ ') : ''}
                {q.note}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  const ringStyle = (value: Animated.Value) => ({
    opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
    transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
  });

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bgCard, borderColor: theme.rule }]}>
      <View style={styles.buttonSlot}>
        <Animated.View pointerEvents="none" style={[styles.ring, { backgroundColor: NEON_RED }, ringStyle(ripple1)]} />
        <Animated.View pointerEvents="none" style={[styles.ring, { backgroundColor: NEON_RED }, ringStyle(ripple2)]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            {
              backgroundColor: NEON_RED,
              opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] }),
              transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
            },
          ]}
        />
        <Pressable
          onPress={() => navigation.navigate('Markets')}
          accessibilityRole="button"
          accessibilityLabel="Open Markets"
          style={[styles.marketsButton, { backgroundColor: NEON_RED }]}
        >
          <Feather name="trending-up" size={14} color="#FFFFFF" />
          <Text style={[type.mono, { color: '#FFFFFF' }]}>MKTS</Text>
        </Pressable>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.trackInner, { transform: [{ translateX }] }]}>
          {renderSet('a', setWidth ? undefined : setSetWidth)}
          {renderSet('b')}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingLeft: space.md, paddingVertical: space.xs },
  buttonSlot: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 72,
    height: 30,
    borderRadius: radius.pill,
  },
  glow: {
    position: 'absolute',
    width: 76,
    height: 32,
    borderRadius: radius.pill,
  },
  marketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
  },
  track: { flex: 1, overflow: 'hidden' },
  trackInner: { flexDirection: 'row' },
  row: { flexDirection: 'row', paddingHorizontal: space.lg, paddingVertical: space.sm, gap: space.xl },
  item: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
});
