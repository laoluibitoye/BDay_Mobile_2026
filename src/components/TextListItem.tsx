import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Article } from '../data/types';
import { authors } from '../data/mock';
import { space, type, useTheme } from '../theme';

type Props = {
  article: Article;
  onPress: () => void;
  showDivider?: boolean;
};

// design.md §6 "Text list item" — WSJ-style text-only row: headline + dek, no thumbnail, no card chrome.
export function TextListItem({ article, onPress, showDivider = true }: Props) {
  const { theme } = useTheme();
  const author = authors.find((a) => a.id === article.authorId);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, showDivider && { borderBottomWidth: 1, borderColor: theme.rule }]}
    >
      <Text style={[type.sectionHeadline, { color: theme.ink }]} numberOfLines={3}>
        {article.headline}
      </Text>
      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]} numberOfLines={2}>
        {article.dek}
      </Text>
      <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.sm }]}>
        {author?.name.toUpperCase()} · {article.publishedAt}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: space.md },
});
