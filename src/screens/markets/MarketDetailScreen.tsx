import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'MarketDetail'>;

// No live market-data feed exists yet — see MarketTickerStrip.tsx for the same note.
export function MarketDetailScreen({ route }: Props) {
  const { symbol } = route.params;
  return (
    <Screen header={<AppHeader variant="compact" title={symbol} showBack />}>
      <FeedEmptyState title="Not available yet" message="Live price and chart data aren't available yet." />
    </Screen>
  );
}
