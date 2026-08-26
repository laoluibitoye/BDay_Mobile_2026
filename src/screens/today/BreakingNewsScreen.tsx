import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { space, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BreakingNews'>;

// No live "breaking now" feed exists yet — this used to always show one permanently-fixed
// hardcoded story regardless of which live article was actually tapped.
export function BreakingNewsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.ink }]}>
      <Pressable
        style={styles.close}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
      >
        <Feather name="x" size={24} color={theme.bg} />
      </Pressable>
      <FeedEmptyState light title="Not available yet" message="Live breaking-news coverage isn't available yet." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, paddingTop: space.huge, justifyContent: 'center' },
  close: { position: 'absolute', top: 60, right: space.xl },
});
