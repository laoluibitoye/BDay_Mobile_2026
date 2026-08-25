import React, { useEffect, useState } from 'react';
import { FlatList, Platform, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { articlesForTaxonomy } from '../../data/mock';
import { Article } from '../../data/types';
import { getSectionFeed } from '../../lib/api/content';
import { useAppState } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SectionFeed'>;

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// The "archive" view — every post tagged to a category/taxonomy (by `section` or secondary
// `tags`), newest first, scrolled continuously (this is the "view full archive" destination from
// Home and the Latest → Explore taxonomy cloud). Tries the real WordPress category archive first
// (via businessday-app-connector's cached section feed); falls back to the mock taxonomy pool
// when that section doesn't exist yet on the connected site, or no site is configured.
export function SectionFeedScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { section } = route.params;
  const { recordTaxonomyUse } = useAppState();
  const [feed, setFeed] = useState<Article[]>(() => articlesForTaxonomy(section));

  useEffect(() => {
    recordTaxonomyUse(section);
    getSectionFeed(slugify(section))
      .then(({ articles: real }) => {
        if (real.length > 0) setFeed(real);
      })
      .catch(() => {
        // keep the mock fallback already in state
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title={section} showBack />}>
      <FlatList
        {...(Platform.OS === 'android'
          ? { removeClippedSubviews: true, windowSize: 7, maxToRenderPerBatch: 6, updateCellsBatchingPeriod: 50, initialNumToRender: 6 }
          : {})}
        style={{ flex: 1 }}
        data={feed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>No stories in this section yet.</Text>
        }
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
        )}
      />
    </Screen>
  );
}
