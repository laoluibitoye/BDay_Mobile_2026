import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Article } from '../data/types';
import { layout, radius, space, type, useTheme } from '../theme';
import { ArticleImage } from './ArticleImage';
import { SectionLabel } from './SectionLabel';

type Props = {
  label: string;
  articles: Article[];
  onPressArticle: (id: string) => void;
};

// design.md §6 "Tile grid row" — 2-column "Recent Highlights" cluster: glanceable, no toolbar.
export function TileGridRow({ label, articles, onPressArticle }: Props) {
  const pairedArticles = articles.length % 2 === 0 ? articles : articles.slice(0, -1);

  return (
    <View style={{ marginBottom: layout.sectionGap, paddingHorizontal: space.lg }}>
      <SectionLabel label={label} />
      <View style={styles.grid}>
        {pairedArticles.map((article) => (
          <Tile key={article.id} article={article} onPress={() => onPressArticle(article.id)} />
        ))}
      </View>
    </View>
  );
}

function Tile({ article, onPress }: { article: Article; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <ArticleImage article={article} style={styles.thumb} />
      <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.sm }]}>{article.section.toUpperCase()}</Text>
      <Text style={[type.label, { color: theme.ink, marginTop: 2 }]} numberOfLines={3}>
        {article.headline}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.sm },
  tile: { width: '47%' },
  thumb: { width: '100%', height: 140, borderRadius: radius.card },
});
