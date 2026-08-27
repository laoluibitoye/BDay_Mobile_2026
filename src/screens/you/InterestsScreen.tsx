import React from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { InterestChipGrid } from '../../components/InterestChipGrid';
import { useAppState } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

const MAX_INTERESTS = 5;

// Revisit-interests screen, reachable from Settings — same chip-grid UI as onboarding's
// InterestPickerScreen, backed by the same server-synced followedTopics/toggleFollowedTopic.
export function InterestsScreen() {
  const { theme } = useTheme();
  const { followedTopics, toggleFollowedTopic } = useAppState();

  return (
    <Screen header={<AppHeader variant="compact" title="Your interests" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Pick up to {MAX_INTERESTS} topics to personalize your Home feed and News Brief.
        </Text>
        <InterestChipGrid selectedIds={followedTopics} onToggle={toggleFollowedTopic} maxCount={MAX_INTERESTS} />
      </View>
    </Screen>
  );
}
