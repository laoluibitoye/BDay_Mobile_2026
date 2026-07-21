import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { interestTopics } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { radius, space, type, useTheme } from '../../theme';

export function FeedSettingsScreen() {
  const { theme } = useTheme();
  const { followedTopics, toggleFollowedTopic } = useAppState();

  return (
    <Screen header={<AppHeader variant="compact" title="Feed Settings" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Followed topics shape your Today feed and For You personalization.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xl }}>
          {interestTopics.map((topic) => {
            const active = followedTopics.includes(topic);
            return (
              <Pressable
                key={topic}
                onPress={() => toggleFollowedTopic(topic)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  borderWidth: 1,
                  borderRadius: radius.pill,
                  paddingVertical: space.sm,
                  paddingHorizontal: space.lg,
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
