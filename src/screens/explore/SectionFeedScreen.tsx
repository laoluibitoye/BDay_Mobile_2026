import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { Article } from '../../data/types';
import { getSectionFeed, getTagFeed } from '../../lib/api/content';
import { useAppState } from '../../state/AppState';
import { space } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SectionFeed'>;

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// The "archive" view — every post tagged to a category/taxonomy (by `section` or secondary
// `tags`), newest first, scrolled continuously (this is the "view full archive" destination from
// Home and the Latest → Explore taxonomy cloud) — the real WordPress category archive via
// businessday-app-connector's cached section feed.
export function SectionFeedScreen({ route, navigation }: Props) {
  const { section, sourceType, sourceValue } = route.params;
  const { recordTaxonomyUse } = useAppState();
  const [feed, setFeed] = useState<Article[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    recordTaxonomyUse(section);
    // A caller that knows this section is tag-sourced (e.g. Home's "Latest Stories"/"In Other
    // News", backed by bdrecent/bdothernews tags, not a real category) passes sourceType/
    // sourceValue explicitly — slugifying the display label into a category query would just
    // query a category that doesn't exist and silently return nothing. Every other caller (the
    // category tab strip, the Explore taxonomy cloud) has no such override and keeps the
    // original slugify-the-label-as-a-category behavior.
    const request =
      sourceType === 'tag' && sourceValue
        ? getTagFeed(sourceValue)
        : getSectionFeed(sourceValue || slugify(section));
    request.then(({ articles }) => setFeed(articles)).catch(() => setFailed(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, sourceType, sourceValue]);

  useEffect(load, [load]);

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title={section} showBack />}>
      <FlatList
        {...(Platform.OS === 'android'
          ? { removeClippedSubviews: true, windowSize: 7, maxToRenderPerBatch: 6, updateCellsBatchingPeriod: 50, initialNumToRender: 6 }
          : {})}
        style={{ flex: 1 }}
        data={feed ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          failed ? (
            <FeedEmptyState
              title="Couldn't load this section"
              message="Check your connection and try again."
              onRetry={load}
            />
          ) : feed !== null ? (
            <FeedEmptyState title="No stories yet" message={`Nothing published in ${section} yet.`} />
          ) : null
        }
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
        )}
      />
    </Screen>
  );
}
