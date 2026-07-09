import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Article } from '../data/types';
import { layout, radius, space, type, useTheme } from '../theme';
import { SectionLabel } from './SectionLabel';

type Props = {
  label: string;
  articles: Article[];
  onPressArticle: (id: string) => void;
};

const TILE_WIDTH = 168;

// design.md §6 "Brief carousel rail" — Economist-style "World in Brief" analog: glanceable, not actionable inline.
export function BriefCarouselRail({ label, articles, onPressArticle }: Props) {
  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <View style={{ paddingHorizontal: space.lg }}>
        <SectionLabel label={label} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}
      >
        {articles.map((article) => (
          <BriefTile key={article.id} article={article} onPress={() => onPressArticle(article.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

function BriefTile({ article, onPress }: { article: Article; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.tile, { borderColor: theme.rule, backgroundColor: theme.bgCard }]}>
      <View style={[styles.thumb, { backgroundColor: article.heroColor }]} />
      <Text style={[type.label, { color: theme.ink, marginTop: space.sm }]} numberOfLines={3}>
        {article.headline}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { width: TILE_WIDTH, borderWidth: 1, borderRadius: radius.card, padding: space.sm, overflow: 'hidden' },
  thumb: { width: '100%', height: 108, borderRadius: radius.card - 4 },
});
