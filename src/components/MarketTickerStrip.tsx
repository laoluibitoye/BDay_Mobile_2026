import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { marketTicker } from '../data/mock';
import { space, type, useTheme } from '../theme';

const PIXELS_PER_SECOND = 32;

export function MarketTickerStrip() {
  const { theme } = useTheme();
  const [setWidth, setSetWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

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

  const renderSet = (keySuffix: string, onLayout?: (width: number) => void) => (
    <View
      style={styles.row}
      onLayout={onLayout ? (e) => onLayout(e.nativeEvent.layout.width) : undefined}
    >
      {marketTicker.map((q) => {
        const up = q.changePct >= 0;
        const color = up ? theme.marketUp : theme.marketDown;
        return (
          <View key={`${q.symbol}-${keySuffix}`} style={styles.item}>
            <Text style={[type.mono, { color: theme.inkMuted }]}>{q.symbol}</Text>
            <Text style={[type.mono, { color: theme.ink }]}>{q.value}</Text>
            <Text style={[type.mono, { color }]}>
              {up ? '▲' : '▼'} {Math.abs(q.changePct).toFixed(1)}%
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bgCard, borderColor: theme.rule }]}>
      <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
        {renderSet('a', setWidth ? undefined : setSetWidth)}
        {renderSet('b')}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1, overflow: 'hidden' },
  track: { flexDirection: 'row' },
  row: { flexDirection: 'row', paddingHorizontal: space.lg, paddingVertical: space.sm, gap: space.xl },
  item: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
});
