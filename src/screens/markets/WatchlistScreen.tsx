import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { SectionLabel } from '../../components/SectionLabel';
import { marketQuotes } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { layout, space, type, useTheme } from '../../theme';

export function WatchlistScreen() {
  const { theme } = useTheme();
  const { watchlistSymbols, toggleWatchlist } = useAppState();
  const watched = marketQuotes.filter((q) => watchlistSymbols.includes(q.symbol));
  const rest = marketQuotes.filter((q) => !watchlistSymbols.includes(q.symbol));

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
          <QuoteRow key={q.symbol} symbol={q.symbol} label={q.label} value={q.value} changePct={q.changePct} watched onToggle={() => toggleWatchlist(q.symbol)} />
        ))}

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="All symbols" />
          {rest.map((q) => (
            <QuoteRow key={q.symbol} symbol={q.symbol} label={q.label} value={q.value} changePct={q.changePct} watched={false} onToggle={() => toggleWatchlist(q.symbol)} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

function QuoteRow({
  symbol,
  label,
  value,
  changePct,
  watched,
  onToggle,
}: {
  symbol: string;
  label: string;
  value: string;
  changePct: number;
  watched: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();
  const up = changePct >= 0;
  const color = up ? theme.marketUp : theme.marketDown;

  return (
    <View
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
        <Text style={[type.label, { color: theme.ink }]}>{label}</Text>
        <Text style={[type.mono, { color: theme.inkFaint, marginTop: 2 }]}>{symbol}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[type.mono, { color: theme.ink }]}>{value}</Text>
        <Text style={[type.mono, { color, marginTop: 2 }]}>
          {up ? '▲' : '▼'} {Math.abs(changePct).toFixed(1)}%
        </Text>
      </View>
    </View>
  );
}
