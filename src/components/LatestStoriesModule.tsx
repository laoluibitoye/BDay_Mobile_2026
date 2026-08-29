import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { getRegisteredArticle, getTagFeed } from '../lib/api/content';
import { Article } from '../data/types';
import { layout, radius, space, type, useTheme } from '../theme';
import { TextListItem } from './TextListItem';

type Props = {
  articleIds: string[];
  onPressArticle: (id: string) => void;
};

// Latest Stories keeps its "See all →" header (the generic sectionLabel module, prepended by
// HomeScreen) as the way to jump to the full archive — this is a second, additive way to read
// further without leaving Home: a plain "Load more" appending the next page of the same bdrecent
// tag feed LatestScreen's own Recent tab already paginates through. Dedupes by id, since Home's
// initial batch and the tag feed's own page size don't necessarily line up on the same boundary.
export function LatestStoriesModule({ articleIds: initialIds, onPressArticle }: Props) {
  const { theme } = useTheme();
  const [ids, setIds] = useState(initialIds);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const { articles, hasMore } = await getTagFeed('bdrecent', page);
      const known = new Set(ids);
      const fresh = articles.map((a) => a.id).filter((id) => !known.has(id));
      setIds((prev) => [...prev, ...fresh]);
      setPage((p) => p + 1);
      if (!hasMore && fresh.length === 0) setExhausted(true);
    } catch {
      setExhausted(true);
    } finally {
      setLoading(false);
    }
  };

  const articles = ids.map((id) => getRegisteredArticle(id)).filter((a): a is Article => !!a);

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      {articles.map((article, i) => (
        <TextListItem
          key={article.id}
          article={article}
          onPress={() => onPressArticle(article.id)}
          showDivider={i < articles.length - 1}
        />
      ))}
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
