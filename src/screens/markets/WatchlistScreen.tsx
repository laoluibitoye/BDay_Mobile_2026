import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { SectionLabel } from '../../components/SectionLabel';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { getMarketPulse, type MarketPulseItem } from '../../lib/api/marketPulse';
import { useAppState } from '../../state/AppState';
import { layout, space, type, useTheme } from '../../theme';

export function WatchlistScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { watchlistSymbols, toggleWatchlist } = useAppState();
  const [items, setItems] = useState<MarketPulseItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    getMarketPulse()
      .then((res) => setItems(res.items))
      .catch(() => setFailed(true));
  };

  useEffect(load, []);

  if (failed) {
    return (
      <Screen header={<AppHeader variant="compact" title="Watchlist" showBack />}>
        <FeedEmptyState title="Couldn't load Watchlist" message="Check your connection and try again." onRetry={load} />
      </Screen>
    );
  }

  if (items === null) {
    return <Screen header={<AppHeader variant="compact" title="Watchlist" showBack />}>{null}</Screen>;
  }

  const watched = items.filter((q) => watchlistSymbols.includes(q.id));
  const rest = items.filter((q) => !watchlistSymbols.includes(q.id));

  return (
    <Screen header={<AppHeader variant="compact" title="Watchlist" showBack />}>
      <View style={{ padding: space.lg }}>
        <SectionLabel label="Your watchlist" />
        {watched.length === 0 && (
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginBottom: space.lg }]}>
            Tap the star on any symbol below to pin it here.
          </Text>
        )}
        {watched.map((q) => (
          <QuoteRow key={q.id} item={q} watched onToggle={() => toggleWatchlist(q.id)} onPress={() => navigation.navigate('MarketDetail', { symbol: q.id })} />
        ))}

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="All symbols" />
          {rest.map((q) => (
            <QuoteRow key={q.id} item={q} watched={false} onToggle={() => toggleWatchlist(q.id)} onPress={() => navigation.navigate('MarketDetail', { symbol: q.id })} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

function QuoteRow({
  item,
  watched,
  onToggle,
  onPress,
}: {
  item: MarketPulseItem;
  watched: boolean;
  onToggle: () => void;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const isPercent = item.note_type === 'percent';
  const up = isPercent && !item.note.trim().startsWith('-');
  const color = isPercent ? (up ? theme.marketUp : theme.marketDown) : theme.inkMuted;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: space.md,
        borderBottomWidth: 1,
        borderColor: theme.rule,
        gap: space.md,
      }}
    >
      <Pressable
        onPress={onToggle}
        hitSlop={(layout.touchTarget - 18) / 2}
        accessibilityRole="button"
        accessibilityLabel={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Ionicons name={watched ? 'star' : 'star-outline'} size={18} color={watched ? theme.accent : theme.inkFaint} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[type.label, { color: theme.ink }]}>{item.label}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[type.mono, { color: theme.ink }]}>{item.value}</Text>
        {!!item.note && (
          <Text style={[type.mono, { color, marginTop: 2 }]}>
            {isPercent ? (up ? '▲ ' : '▼ ') : ''}
            {item.note}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
