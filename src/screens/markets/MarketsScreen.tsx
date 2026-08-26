import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { getMarketPulse, type MarketPulseItem } from '../../lib/api/marketPulse';
import { space, type, useTheme } from '../../theme';

export function MarketsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<MarketPulseItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    getMarketPulse()
      .then((res) => setItems(res.items))
      .catch(() => setFailed(true));
  };

  useEffect(load, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader
        variant="compact"
        title="Markets"
        showBack
        rightAction={{ icon: 'star', onPress: () => navigation.navigate('Watchlist'), accessibilityLabel: 'Watchlist' }}
      />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 140, flexGrow: 1 }}>
        {failed ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <FeedEmptyState title="Couldn't load Markets" message="Check your connection and try again." onRetry={load} />
          </View>
        ) : items === null ? null : items.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <FeedEmptyState title="Nothing here yet" message="No market figures have been published yet." />
          </View>
        ) : (
          items.map((q) => {
            const isPercent = q.note_type === 'percent';
            const up = isPercent && !q.note.trim().startsWith('-');
            const color = isPercent ? (up ? theme.marketUp : theme.marketDown) : theme.inkMuted;
            return (
              <Pressable
                key={q.id}
                onPress={() => navigation.navigate('MarketDetail', { symbol: q.id })}
                accessibilityRole="button"
                accessibilityLabel={`${q.label}, ${q.value}${q.note ? `, ${q.note}` : ''}, view detail`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  paddingVertical: space.md,
                  borderBottomWidth: 1,
                  borderColor: theme.rule,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[type.label, { color: theme.ink }]}>{q.label}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[type.mono, { color: theme.ink }]}>{q.value}</Text>
                  {!!q.note && (
                    <Text style={[type.mono, { color, marginTop: 2 }]}>
                      {isPercent ? (up ? '▲ ' : '▼ ') : ''}
                      {q.note}
                    </Text>
                  )}
                </View>
                <Feather name="chevron-right" size={16} color={theme.inkFaint} />
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
