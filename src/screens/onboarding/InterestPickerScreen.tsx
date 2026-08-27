import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { InterestChipGrid } from '../../components/InterestChipGrid';
import { useAppState } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'InterestPicker'>;

const MAX_INTERESTS = 5;

export function InterestPickerScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { followedTopics, toggleFollowedTopic } = useAppState();
  const canContinue = followedTopics.length >= 2;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[type.articleHeadline, { color: theme.ink }]}>What do you want to follow?</Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>
          Pick 2-5 topics to start
        </Text>

        <InterestChipGrid selectedIds={followedTopics} onToggle={toggleFollowedTopic} maxCount={MAX_INTERESTS} />
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
  footer: { position: 'absolute', left: space.xl, right: space.xl, bottom: space.xxl },
});
