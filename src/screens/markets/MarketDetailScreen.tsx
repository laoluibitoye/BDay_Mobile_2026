import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { getMarketPulse, type MarketPulseItem } from '../../lib/api/marketPulse';
import { useAppState } from '../../state/AppState';
import { layout, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MarketDetail'>;

// No historical price series exists in the admin-edited Market Pulse data (see
// MarketTickerStrip.tsx) — no chart is fabricated to fill that gap, just the same figure/note the
// list screen and the website both show.
export function MarketDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { symbol } = route.params;
  const { watchlistSymbols, toggleWatchlist } = useAppState();
  const [item, setItem] = useState<MarketPulseItem | null | undefined>(undefined);

  useEffect(() => {
    getMarketPulse()
      .then((res) => setItem(res.items.find((q) => q.id === symbol) ?? null))
      .catch(() => setItem(null));
  }, [symbol]);

  if (item === undefined) {
    return <Screen header={<AppHeader variant="compact" title={symbol} showBack />}>{null}</Screen>;
  }

  if (!item) {
    return (
      <Screen header={<AppHeader variant="compact" title={symbol} showBack />}>
        <FeedEmptyState title="Not found" message="This figure isn't published right now." />
      </Screen>
    );
  }

  const watched = watchlistSymbols.includes(symbol);
  const isPercent = item.note_type === 'percent';
  const up = isPercent && !item.note.trim().startsWith('-');
  const color = isPercent ? (up ? theme.marketUp : theme.marketDown) : theme.inkMuted;

  return (
    <Screen header={<AppHeader variant="compact" title={item.label} showBack />}>
      <View style={{ padding: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={[type.displayHeadline, { color: theme.ink }]}>{item.label}</Text>
          </View>
          <Pressable
            onPress={() => toggleWatchlist(symbol)}
            hitSlop={(layout.touchTarget - 22) / 2}
            accessibilityRole="button"
            accessibilityLabel={watched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Ionicons name={watched ? 'star' : 'star-outline'} size={22} color={watched ? theme.accent : theme.inkFaint} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.md, marginTop: space.lg }}>
          <Text style={[type.displayHeadline, { color: theme.ink }]}>{item.value}</Text>
          {!!item.note && (
            <Text style={[type.label, { color }]}>
              {isPercent ? (up ? '▲ ' : '▼ ') : ''}
              {item.note}
            </Text>
          )}
        </View>
      </View>
    </Screen>
  );
}
