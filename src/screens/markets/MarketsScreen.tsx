import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { space, useTheme } from '../../theme';

// No live market-data feed exists yet — see MarketTickerStrip.tsx for the same note.
export function MarketsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader
        variant="compact"
        title="Markets"
        showBack
        rightAction={{ icon: 'star', onPress: () => navigation.navigate('Watchlist'), accessibilityLabel: 'Watchlist' }}
      />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 140, flexGrow: 1, justifyContent: 'center' }}>
        <FeedEmptyState title="Markets is coming soon" message="Live indices, FX, commodities, and crypto data aren't available yet." />
      </ScrollView>
    </SafeAreaView>
  );
}
