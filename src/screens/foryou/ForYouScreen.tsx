import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { ListRow } from '../../components/ListRow';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import type { Article } from '../../data/types';
import { getRegisteredArticle, registerArticle } from '../../lib/api/content';
import { useAppState } from '../../state/AppState';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useReadingHistory } from '../../hooks/useReadingHistory';
import type { BookmarkRow } from '../../lib/api/bookmarks';
import type { ReadingHistoryRow } from '../../lib/api/readingHistory';
import { layout, radius, space, type, useTheme } from '../../theme';

const TABS = ['Saved', 'History', 'Downloads', 'Newsletters'] as const;
type Tab = (typeof TABS)[number];

// Bookmark/reading-history rows only carry the denormalized {postId, title, url, imageUrl} the
// backend stores at save time — not a full Article. Registering a minimal Article from each row
// (via content.ts's shared registry) means tapping through from this tab still resolves the real
// article in ArticleReaderScreen via its live entitlement check, rather than only ever
// falling back to an arbitrary mock article for a post never fetched this session.
function rowToArticle(row: BookmarkRow | ReadingHistoryRow, section: string): Article {
  return {
    id: row.postId,
    headline: row.title,
    dek: '',
    section,
    authorId: '',
    authorName: '',
    publishedAt: '',
    contentType: 'news',
    isPremium: false,
    readTime: '',
    body: [],
    heroColor: '#333333',
    imageUrl: row.imageUrl ?? undefined,
    sourceUrl: row.url,
  };
}

// The app's content-interaction hub — everything you've saved, read, downloaded, or
// subscribed to, in one place. Distinct from Settings: this screen is "what you've engaged
// with," Settings is "how the app behaves for you."
export function ForYouScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<Tab>('Saved');
  const { downloadedArticleIds, toggleDownload } = useAppState();

  const bookmarkRows = useBookmarks();
  const historyRows = useReadingHistory();

  const saved = useMemo(() => {
    const rows = bookmarkRows ?? [];
    const mapped = rows.map((row) => rowToArticle(row, 'Saved'));
    for (const a of mapped) registerArticle(a);
    return mapped;
  }, [bookmarkRows]);

  const history = useMemo(() => {
    const rows = historyRows ?? [];
    const mapped = rows.map((row) => rowToArticle(row, 'History'));
    for (const a of mapped) registerArticle(a);
    return mapped;
  }, [historyRows]);

  const downloaded = downloadedArticleIds.map(getRegisteredArticle).filter((a): a is Article => !!a);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="For You" />

      <Pressable
        onPress={() => navigation.navigate('TodaysPaper')}
        accessibilityRole="button"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          marginHorizontal: space.lg,
          marginTop: space.md,
          padding: space.lg,
          borderRadius: radius.card,
          backgroundColor: theme.ink,
        }}
      >
        <Feather name="book-open" size={20} color={theme.bg} />
        <View style={{ flex: 1 }}>
          <Text style={[type.label, { color: theme.bg }]}>Today's Paper</Text>
          <Text style={[type.caption, { color: theme.inkFaint, marginTop: 2 }]}>
            The editor-curated print-style edition
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={theme.inkFaint} />
      </Pressable>

      <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.lg }}>
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={{
                paddingVertical: space.xs,
                paddingHorizontal: space.lg,
                borderRadius: radius.pill,
                backgroundColor: active ? theme.ink : theme.bgCard,
                borderWidth: active ? 0 : 1,
                borderColor: theme.rule,
              }}
            >
              <Text style={[type.label, { color: active ? theme.bg : theme.ink }]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'Saved' && (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          ListEmptyComponent={
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xl }]}>
              {bookmarkRows === null ? 'Loading…' : 'Nothing saved yet — tap the bookmark icon on any article to add it here.'}
            </Text>
          }
          renderItem={({ item }) => (
            <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
          )}
        />
      )}

      {tab === 'History' && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          ListEmptyComponent={
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xl }]}>
              {historyRows === null ? 'Loading…' : 'Articles you open will show up here so you can pick up where you left off.'}
            </Text>
          }
          renderItem={({ item }) => (
            <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
          )}
        />
      )}

      {tab === 'Downloads' && (
        <FlatList
          data={downloaded}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          ListEmptyComponent={
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xl }]}>
              Nothing downloaded yet — open an article and use "Download for offline" to add it here.
            </Text>
          }
          renderItem={({ item }) => (
            <ListRow
              title={item.headline}
              meta={`${item.readTime} · Available offline`}
              onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })}
              rightElement={
                <Pressable
                  onPress={() => toggleDownload(item.id)}
                  hitSlop={(layout.touchTarget - 18) / 2}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.headline} from downloads`}
                >
                  <Feather name="trash-2" size={18} color={theme.inkMuted} />
                </Pressable>
              }
            />
          )}
        />
      )}

      {tab === 'Newsletters' && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="Newsletters coming soon" message="Managing newsletter subscriptions isn't available yet." />
        </View>
      )}
    </SafeAreaView>
  );
}
