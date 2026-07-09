import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { interestTopics } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

export function FeedSettingsScreen() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string[]>(['Banking', 'Markets']);

  const toggle = (topic: string) =>
    setSelected((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));

  return (
    <Screen header={<AppHeader variant="compact" title="Feed Settings" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Followed topics shape your Today feed and For You personalization.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xl }}>
          {interestTopics.map((topic) => {
            const active = selected.includes(topic);
            return (
              <Pressable
                key={topic}
                onPress={() => toggle(topic)}
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
