import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { space, useTheme } from '../theme';

// Bug found live: a feed screen's first fetch is in flight, but `data === []`/`null` looked
// indistinguishable from "loaded, genuinely nothing here" — so FeedEmptyState's "Nothing here
// yet"/"No stories yet" showed (or on screens careful enough to check for `null`, just a blank
// screen) while content was still on its way in. Deliberately a separate component from
// FeedEmptyState rather than a third prop on it — "still loading" and "loaded, nothing to show"
// are different states with different meanings, and conflating them is exactly the bug this
// fixes. Every screen using this should gate it on its own real "not yet loaded" sentinel (a
// `T[] | null` starting `null`, or an explicit `loaded` flag), never on `data.length === 0` alone.
// Color matches the pull-to-refresh spinner (RefreshControl's tintColor is theme.accent
// everywhere it's used) — reader-requested, so the two spinners a reader sees for the same kind
// of wait (first load vs. manual refresh) read as the same control instead of two different ones.
export function FeedLoadingState() {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
      <ActivityIndicator color={theme.accent} size="large" />
    </View>
  );
}
