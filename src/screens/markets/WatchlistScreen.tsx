import React from 'react';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';

// No live market-data feed exists yet — see MarketTickerStrip.tsx for the same note.
export function WatchlistScreen() {
  return (
    <Screen header={<AppHeader variant="compact" title="Watchlist" showBack />}>
      <FeedEmptyState title="Watchlist is coming soon" message="Live market data isn't available yet." />
    </Screen>
  );
}
