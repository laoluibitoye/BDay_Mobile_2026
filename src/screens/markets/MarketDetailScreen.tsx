import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { SectionLabel } from '../../components/SectionLabel';
import { ArticleCard } from '../../components/ArticleCard';
import { marketQuotes, articles } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { layout, radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MarketDetail'>;

// Deterministic mini sparkline bars from the symbol string — no real historical price
// series exists yet in the mock dataset, so this stands in for a real chart.
function sparkline(symbol: string): number[] {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed = (seed * 31 + symbol.charCodeAt(i)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < 24; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    bars.push(0.25 + ((seed >>> 8) % 100) / 100);
  }
  return bars;
}

export function MarketDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { symbol } = route.params;
  const { watchlistSymbols, toggleWatchlist } = useAppState();
  const quote = marketQuotes.find((q) => q.symbol === symbol);
  const watched = watchlistSymbols.includes(symbol);
  const related = articles.filter((a) => a.section === 'Markets').slice(0, 3);

  if (!quote) {
    return (
      <Screen header={<AppHeader variant="compact" title={symbol} showBack />}>
        <Text style={[type.bodyUI, { color: theme.inkMuted, padding: space.lg }]}>Symbol not found.</Text>
      </Screen>
    );
  }

  const up = quote.changePct >= 0;
  const color = up ? theme.marketUp : theme.marketDown;
  const bars = sparkline(symbol);

  return (
    <Screen header={<AppHeader variant="compact" title={quote.symbol} showBack />}>
      <View style={{ padding: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={[type.mono, { color: theme.inkFaint }]}>{quote.category.toUpperCase()}</Text>
            <Text style={[type.displayHeadline, { color: theme.ink, marginTop: 2 }]}>{quote.label}</Text>
            <Text style={[type.mono, { color: theme.inkMuted, marginTop: 4 }]}>{quote.symbol}</Text>
          </View>
          <Pressable
            onPress={() => toggleWatchlist(quote.symbol)}
            hitSlop={(layout.touchTarget - 22) / 2}
            accessibilityRole="button"
            accessibilityLabel={watched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Ionicons name={watched ? 'star' : 'star-outline'} size={22} color={watched ? theme.accent : theme.inkFaint} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.md, marginTop: space.lg }}>
          <Text style={[type.displayHeadline, { color: theme.ink }]}>{quote.value}</Text>
          <Text style={[type.label, { color }]}>
            {up ? '▲' : '▼'} {Math.abs(quote.changePct).toFixed(1)}%
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 3,
            height: 100,
            marginTop: space.xl,
            paddingHorizontal: space.sm,
            borderRadius: radius.card,
            backgroundColor: theme.bgCard,
            borderWidth: 1,
            borderColor: theme.rule,
          }}
          accessibilityLabel={`${quote.symbol} 24-session trend chart`}
        >
          {bars.map((h, i) => (
            <View
              key={i}
              style={{ flex: 1, height: `${Math.round(h * 100)}%`, backgroundColor: color, borderRadius: 2, opacity: 0.85 }}
            />
          ))}
        </View>

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="Related coverage" />
          {related.map((a) => (
            <ArticleCard key={a.id} article={a} onPress={() => navigation.navigate('ArticleReader', { articleId: a.id })} />
          ))}
        </View>

        <Pressable
          onPress={() => navigation.navigate('Markets')}
          accessibilityRole="button"
          style={{
            marginTop: space.md,
            padding: space.lg,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: theme.rule,
            backgroundColor: theme.bgCard,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={[type.bodyUI, { color: theme.ink }]}>Back to Markets</Text>
          <Feather name="chevron-right" size={18} color={theme.inkFaint} />
        </Pressable>
      </View>
    </Screen>
  );
}
