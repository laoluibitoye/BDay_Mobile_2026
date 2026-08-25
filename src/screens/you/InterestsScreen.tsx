import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { interestTopics } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { layout, radius, space, type, useTheme } from '../../theme';

const MAX_INTERESTS = 5;

// Revisit-interests screen, reachable from Settings — same chip-grid UI as onboarding's
// InterestPickerScreen, backed by the same server-synced followedTopics/toggleFollowedTopic.
export function InterestsScreen() {
  const { theme } = useTheme();
  const { followedTopics, toggleFollowedTopic } = useAppState();
  const atCap = followedTopics.length >= MAX_INTERESTS;

  return (
    <Screen header={<AppHeader variant="compact" title="Your interests" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Pick up to {MAX_INTERESTS} topics to personalize your Home feed and News Brief.
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: layout.chipGap, marginTop: space.xl }}>
          {interestTopics.map((topic) => {
            const active = followedTopics.includes(topic);
            const disabled = !active && atCap;
            return (
              <Pressable
                key={topic}
                onPress={() => toggleFollowedTopic(topic)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled }}
                style={{
                  borderWidth: 1,
                  borderRadius: radius.pill,
                  paddingVertical: layout.chipPaddingV,
                  paddingHorizontal: space.lg,
                  opacity: disabled ? 0.4 : 1,
                  borderColor: active ? theme.accent : theme.rule,
                  backgroundColor: active ? theme.accentTint : theme.bgCard,
                }}
              >
                <Text style={[type.label, { color: active ? theme.accentDeep : theme.ink }]}>{topic}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
