import React, { useEffect, useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { ArticleCard } from '../../components/ArticleCard';
import { getAuthorArchive, type AuthorProfile } from '../../lib/api/content';
import type { Article } from '../../data/types';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ColumnistPage'>;

// Real author bio/avatar plus their own post archive, via the connector plugin's new
// /author/{id} endpoint — mirrors single-default.php's own author-bio block.
export function ColumnistPageScreen({ route }: Props) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { authorId } = route.params;
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    getAuthorArchive(authorId)
      .then((res) => {
        setAuthor(res.author);
        setArticles(res.articles);
        setPage(res.page);
        setHasMore(res.hasMore);
      })
      .catch(() => setFailed(true));
  };

  useEffect(load, [authorId]);

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    getAuthorArchive(authorId, page + 1)
      .then((res) => {
        setArticles((prev) => [...prev, ...res.articles]);
        setPage(res.page);
        setHasMore(res.hasMore);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  };

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Columnist" showBack />}>
      {failed ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="Couldn't load this author" message="Check your connection and try again." onRetry={load} />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListHeaderComponent={
            author ? (
              <View style={{ alignItems: 'center', marginBottom: space.xl }}>
                {author.avatarUrl && (
                  <Image
                    source={{ uri: author.avatarUrl }}
                    style={{ width: 72, height: 72, borderRadius: radius.pill, backgroundColor: theme.bgCard }}
                  />
                )}
                <Text style={[type.articleHeadline, { color: theme.ink, marginTop: space.md, textAlign: 'center' }]}>
                  {author.name}
                </Text>
                {!!author.bio && (
                  <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs, textAlign: 'center' }]}>
                    {author.bio}
                  </Text>
                )}
              </View>
            ) : null
          }
          ListEmptyComponent={
            author ? (
              <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center', marginTop: space.xl }]}>
                No published articles yet.
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
          )}
        />
      )}
    </Screen>
  );
}
