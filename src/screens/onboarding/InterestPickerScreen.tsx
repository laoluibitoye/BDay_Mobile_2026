import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { interestTopics } from '../../data/mock';
import { Button } from '../../components/Button';
import { layout, radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'InterestPicker'>;

export function InterestPickerScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string[]>(['Banking', 'Markets']);

  const toggle = (topic: string) => {
    setSelected((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const canContinue = selected.length >= 2;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
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

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, paddingTop: space.huge },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.chipGap, marginTop: space.xl },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: layout.chipPaddingV, paddingHorizontal: space.lg },
  footer: { position: 'absolute', left: space.xl, right: space.xl, bottom: space.xxl },
});
