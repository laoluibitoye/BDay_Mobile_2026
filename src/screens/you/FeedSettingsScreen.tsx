import React from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { InterestChipGrid } from '../../components/InterestChipGrid';
import { useAppState } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

const MAX_INTERESTS = 5;

export function FeedSettingsScreen() {
  const { theme } = useTheme();
  const { followedTopics, toggleFollowedTopic } = useAppState();

  return (
    <Screen header={<AppHeader variant="compact" title="Feed Settings" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Followed topics shape your Today feed and For You personalization.
        </Text>
        <InterestChipGrid selectedIds={followedTopics} onToggle={toggleFollowedTopic} maxCount={MAX_INTERESTS} />
      </View>
    </Screen>
  );
}
