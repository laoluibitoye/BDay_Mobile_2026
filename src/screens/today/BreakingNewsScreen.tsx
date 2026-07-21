import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { LiveBadge } from '../../components/Badge';
import { breakingArticle } from '../../data/mock';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BreakingNews'>;

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
      <LiveBadge />
      <Text style={[type.displayHeadline, { color: theme.bg, marginTop: space.lg }]}>
        {breakingArticle.headline}
      </Text>
      <Text style={[type.bodyUI, { color: theme.inkFaint, marginTop: space.md }]}>{breakingArticle.dek}</Text>
      <Pressable
        style={[styles.cta, { borderColor: theme.accent }]}
        onPress={() => navigation.replace('ArticleReader', { articleId: breakingArticle.id })}
      >
        <Text style={[type.label, { color: theme.accent }]}>Read full story</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, paddingTop: space.huge, justifyContent: 'center' },
  close: { position: 'absolute', top: 60, right: space.xl },
  cta: { marginTop: space.xxl, borderWidth: 1, borderRadius: 8, paddingVertical: space.md, alignItems: 'center' },
});
