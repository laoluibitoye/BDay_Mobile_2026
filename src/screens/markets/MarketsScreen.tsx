import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { SectionLabel } from '../../components/SectionLabel';
import { marketQuotes } from '../../data/mock';
import { MarketQuote } from '../../data/types';
import { useAppState } from '../../state/AppState';
import { layout, radius, space, type, useTheme } from '../../theme';

const CATEGORIES: MarketQuote['category'][] = ['Indices', 'FX', 'Commodities', 'Crypto'];

export function MarketsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { watchlistSymbols, toggleWatchlist } = useAppState();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader
        variant="compact"
        title="Markets"
        showBack
        rightAction={{ icon: 'star', onPress: () => navigation.navigate('Watchlist'), accessibilityLabel: 'Watchlist' }}
      />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}>
        {CATEGORIES.map((category) => {
          const quotes = marketQuotes.filter((q) => q.category === category);
          if (quotes.length === 0) return null;
          return (
            <View key={category} style={{ marginBottom: space.xl }}>
              <SectionLabel label={category} />
              {quotes.map((q) => {
                const up = q.changePct >= 0;
                const color = up ? theme.marketUp : theme.marketDown;
                const watched = watchlistSymbols.includes(q.symbol);
                return (
                  <Pressable
                    key={q.symbol}
                    onPress={() => navigation.navigate('MarketDetail', { symbol: q.symbol })}
                    accessibilityRole="button"
                    accessibilityLabel={`${q.label}, ${q.value}, ${up ? 'up' : 'down'} ${Math.abs(q.changePct).toFixed(1)} percent, view detail`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: space.md,
                      paddingVertical: space.md,
                      borderBottomWidth: 1,
                      borderColor: theme.rule,
                    }}
                  >
                    <Pressable
                      onPress={() => toggleWatchlist(q.symbol)}
                      hitSlop={(layout.touchTarget - 16) / 2}
                      accessibilityRole="button"
                      accessibilityLabel={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      <Ionicons name={watched ? 'star' : 'star-outline'} size={16} color={watched ? theme.accent : theme.inkFaint} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text style={[type.label, { color: theme.ink }]}>{q.label}</Text>
                      <Text style={[type.mono, { color: theme.inkFaint, marginTop: 2 }]}>{q.symbol}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[type.mono, { color: theme.ink }]}>{q.value}</Text>
                      <Text style={[type.mono, { color, marginTop: 2 }]}>
                        {up ? '▲' : '▼'} {Math.abs(q.changePct).toFixed(1)}%
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={theme.inkFaint} />
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        <Pressable
          onPress={() => navigation.navigate('Watchlist')}
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
          <Text style={[type.bodyUI, { color: theme.ink }]}>My watchlist</Text>
          <Feather name="chevron-right" size={18} color={theme.inkFaint} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
