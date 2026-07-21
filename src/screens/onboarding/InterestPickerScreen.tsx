import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { interestTopics } from '../../data/mock';
import { Button } from '../../components/Button';
import { useAppState } from '../../state/AppState';
import { layout, radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'InterestPicker'>;

export function InterestPickerScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { followedTopics, toggleFollowedTopic } = useAppState();
  const [selected, setSelected] = useState<string[]>(followedTopics);

  const toggle = (topic: string) => {
    setSelected((prev) => {
      const next = prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic];
      return next;
    });
    toggleFollowedTopic(topic);
  };

  const canContinue = selected.length >= 2;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[type.articleHeadline, { color: theme.ink }]}>What do you want to follow?</Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>
          Pick 2-3 topics to start
        </Text>

        <View style={styles.grid}>
          {interestTopics.map((topic) => {
            const active = selected.includes(topic);
            return (
              <Pressable
                key={topic}
                onPress={() => toggle(topic)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? theme.accent : theme.rule,
                    backgroundColor: active ? theme.accentTint : theme.bgCard,
                  },
                ]}
              >
                <Text style={[type.label, { color: active ? theme.accentDeep : theme.ink }]}>{topic}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!canContinue && (
          <Text style={[type.caption, { color: theme.inkMuted, textAlign: 'center', marginBottom: space.sm }]}>
            Pick at least 2 topics to continue
          </Text>
        )}
        <Button
          label="Continue"
          disabled={!canContinue}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: space.xl, paddingTop: space.huge, paddingBottom: space.huge + space.xxxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.chipGap, marginTop: space.xl },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: layout.chipPaddingV, paddingHorizontal: space.lg },
  footer: { position: 'absolute', left: space.xl, right: space.xl, bottom: space.xxl },
});
