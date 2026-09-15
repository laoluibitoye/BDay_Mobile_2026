import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { getRegisteredArticle, getTagFeed } from '../lib/api/content';
import { Article } from '../data/types';
import { layout, radius, space, type, useTheme } from '../theme';
import { ArticleCard } from './ArticleCard';

type Props = {
  articleIds: string[];
  onPressArticle: (id: string) => void;
};

// Every batch of BATCH_SIZE reads as 2 image-led cards (same ArticleCard/ArticleImage treatment
// used everywhere else, so a video-featured story here gets the same real YouTube thumbnail and
// native player as any other card) followed by 3 plain title rows — repeating for every "Load
// more" click, not just the first screenful.
const BATCH_SIZE = 5;
const FEATURED_PER_BATCH = 2;

// Latest Stories keeps its "See all →" header (the generic sectionLabel module, prepended by
// HomeScreen) as the way to jump to the full archive — this is a second, additive way to read
// further without leaving Home: "Load more" reveals the next BATCH_SIZE of the same bdrecent tag
// feed LatestScreen's own Recent tab already paginates through, fetching another page from the
// server only once the already-fetched buffer runs short. Dedupes by id, since Home's initial
// batch and the tag feed's own page size don't necessarily line up on the same boundary.
export function LatestStoriesModule({ articleIds: initialIds, onPressArticle }: Props) {
  const { theme } = useTheme();
  const [ids, setIds] = useState(initialIds);
  const [visibleCount, setVisibleCount] = useState(Math.min(BATCH_SIZE, initialIds.length));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  const loadMore = async () => {
    const target = visibleCount + BATCH_SIZE;
    if (ids.length >= target) {
      // Already-buffered from a prior fetch (the server's own page size is rarely exactly
      // BATCH_SIZE) — just reveal the next window, no network round-trip needed.
      setVisibleCount(target);
      return;
    }
    setLoading(true);
    try {
      const { articles, hasMore } = await getTagFeed('bdrecent', page);
      const known = new Set(ids);
      const fresh = articles.map((a) => a.id).filter((id) => !known.has(id));
      const merged = [...ids, ...fresh];
      setIds(merged);
      setPage((p) => p + 1);
      setVisibleCount(Math.min(target, merged.length));
      if (!hasMore && merged.length <= target) setExhausted(true);
    } catch {
      setExhausted(true);
    } finally {
      setLoading(false);
    }
  };

  const articles = ids
    .slice(0, visibleCount)
    .map((id) => getRegisteredArticle(id))
    .filter((a): a is Article => !!a);

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      {articles.map((article, i) => {
        const posInBatch = i % BATCH_SIZE;
        const isFeatured = posInBatch < FEATURED_PER_BATCH;
        if (isFeatured) {
          return <ArticleCard key={article.id} article={article} onPress={() => onPressArticle(article.id)} />;
        }
        const nextIsFeatured = i + 1 < articles.length && (i + 1) % BATCH_SIZE < FEATURED_PER_BATCH;
        return (
          <Pressable
            key={article.id}
            onPress={() => onPressArticle(article.id)}
            style={[styles.titleRow, i < articles.length - 1 && !nextIsFeatured && { borderBottomWidth: 1, borderColor: theme.rule }]}
          >
            <Text style={[type.sectionHeadline, { color: theme.ink }]} numberOfLines={3}>
              {article.headline}
            </Text>
          </Pressable>
        );
      })}
      {!exhausted && (
        <Pressable
          onPress={loadMore}
          disabled={loading}
          accessibilityRole="button"
          style={{
            marginTop: space.md,
            paddingVertical: space.sm,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: theme.rule,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? <ActivityIndicator color={theme.inkMuted} /> : <Text style={[type.label, { color: theme.ink }]}>Load more</Text>}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { paddingVertical: space.md },
});
