import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { getTagFeed } from '../../lib/api/content';
import type { Article } from '../../data/types';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BreakingNews'>;

// Real content, not a distinct "breaking" taxonomy — the website's own Breaking Ticker addon
// (addons/breaking-ticker/addon.php) confirms there's no separate breaking-news tag: it's the
// exact same 'bdlead' tag Top News/the Hero use, just presented as a scrolling strip there. This
// screen is the same source, presented as a real live-coverage list instead.
export function BreakingNewsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    getTagFeed('bdlead')
      .then((res) => setArticles(res.articles))
      .catch(() => setFailed(true));
  };

  useEffect(load, []);

  const openArticle = (id: string) => {
    navigation.navigate('ArticleReader', { articleId: id });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.ink }]}>
      <View style={styles.header}>
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={[type.mono, { color: theme.bg }]}>LIVE</Text>
        </View>
        <Text style={[type.sectionHeadline, { color: theme.bg, marginTop: space.sm }]}>Breaking News</Text>
        <Pressable
          style={styles.close}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
        >
          <Feather name="x" size={24} color={theme.bg} />
        </Pressable>
      </View>

      {failed ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState light title="Couldn't load breaking news" message="Check your connection and try again." onRetry={load} />
        </View>
      ) : articles !== null && articles.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState light title="Nothing breaking right now" message="Check back shortly for live coverage." />
        </View>
      ) : (
        <FlatList
          data={articles ?? []}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => openArticle(item.id)}
              accessibilityRole="button"
              style={[styles.row, index === 0 && styles.leadRow]}
            >
              {index === 0 && item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.leadImage} resizeMode="cover" />
              )}
              <Text
                style={[index === 0 ? type.articleHeadline : type.bodyUI, { color: theme.bg, marginTop: index === 0 ? space.md : 0 }]}
                numberOfLines={index === 0 ? 3 : 2}
              >
                {item.headline}
              </Text>
              <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.xs }]}>
                {item.authorName.toUpperCase()} · {item.publishedAt}
              </Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: theme.rule }]} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: space.xl, paddingTop: space.huge, paddingBottom: space.md },
  close: { position: 'absolute', top: 60, right: space.xl },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FF3B30' },
  row: { paddingVertical: space.md },
  leadRow: { paddingBottom: space.lg },
  leadImage: { width: '100%', aspectRatio: 16 / 9, borderRadius: 8 },
  divider: { height: StyleSheet.hairlineWidth },
});
