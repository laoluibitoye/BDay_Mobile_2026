import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Article } from '../data/types';
import { layout, radius, space, type, useTheme } from '../theme';
import { ArticleImage } from './ArticleImage';
import { SectionLabel } from './SectionLabel';

type Props = {
  label?: string;
  articles: Article[];
  onPressArticle: (id: string) => void;
};

const GAP = space.md;
// One full tile plus a quarter-width peek of the next, so the row visibly continues off-screen
// without needing autoscroll to signal "there's more here" — no autoscroll: the reader always
// drives the scroll themselves.
const PEEK_FRACTION = 0.25;

// design.md §6 "Brief carousel rail" — Economist-style "World in Brief" analog: glanceable, not actionable inline.
// `label` is optional — an unlabeled chronological stream (e.g. the Recent tab) skips the header
// rather than showing an empty one.
export function BriefCarouselRail({ label, articles, onPressArticle }: Props) {
  const { width } = useWindowDimensions();
  const tileWidth = (width - space.lg - GAP) / (1 + PEEK_FRACTION);

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      {label && (
        <View style={{ paddingHorizontal: space.lg }}>
          <SectionLabel label={label} />
        </View>
      )}
      <FlatList
        data={articles}
        keyExtractor={(article) => article.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={tileWidth + GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: space.lg, gap: GAP }}
        renderItem={({ item }) => (
          <BriefTile article={item} width={tileWidth} onPress={() => onPressArticle(item.id)} />
        )}
      />
    </View>
  );
}

function BriefTile({ article, width, onPress }: { article: Article; width: number; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.tile, { width }]}>
      <ArticleImage article={article} style={styles.thumb} />
      <Text style={[type.cardTitle, { color: theme.ink, marginTop: space.sm }]} numberOfLines={3}>
        {article.headline}
      </Text>
    </Pressable>
  );
}

// Same borderless, flat language as ArticleCard/HeroArticleCard — a headline+thumbnail tile is
// the same story-card genre as those, just laid out horizontally; the GAP between tiles in the
// row does the visual separation a border used to, so it wasn't left behind as a straggler.
const styles = StyleSheet.create({
  tile: { overflow: 'hidden' },
  thumb: { width: '100%', height: 150, borderRadius: radius.card },
});
