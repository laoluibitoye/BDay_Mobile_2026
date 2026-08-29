import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { ListRow } from '../../components/ListRow';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { Button } from '../../components/Button';
import type { Article } from '../../data/types';
import { getRegisteredArticle, registerArticle } from '../../lib/api/content';
import { getNewsletterLists, subscribeToNewsletters, type NewsletterList } from '../../lib/api/newsletters';
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

// Saved/History/Downloads are all account-backed (bookmarks and history sync server-side; a
// download tied to no account would just orphan on logout) — a guest sees a sign-in prompt here
// instead of an empty list that can never actually fill up.
function SignInPrompt({ message, onSignIn }: { message: string; onSignIn: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
      <Feather name="lock" size={28} color={theme.inkFaint} />
      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.md, textAlign: 'center' }]}>{message}</Text>
      <View style={{ marginTop: space.lg }}>
        <Button label="Sign in" onPress={onSignIn} />
      </View>
    </View>
  );
}

// The app's content-interaction hub — everything you've saved, read, downloaded, or
// subscribed to, in one place. Distinct from Settings: this screen is "what you've engaged
// with," Settings is "how the app behaves for you."
export function ForYouScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<Tab>('Saved');
  const { downloadedArticleIds, toggleDownload, authUser } = useAppState();

  const bookmarkRows = useBookmarks();
  const historyRows = useReadingHistory();

  const [lists, setLists] = useState<NewsletterList[] | null>(null);
  const [listsFailed, setListsFailed] = useState(false);
  const [email, setEmail] = useState(authUser?.email ?? '');
  const [selected, setSelected] = useState<string[]>([]);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const loadLists = () => {
    setListsFailed(false);
    getNewsletterLists()
      .then((res) => {
        setLists(res.lists);
        // No subscriber-status lookup exists yet (would need a new fc-bridge endpoint), so —
        // same as the website's own signup form — every list starts checked; unchecking one
        // before Subscribe sends it as a detach, which is how a reader actually opts out.
        setSelected(res.lists.map((l) => l.id));
      })
      .catch(() => setListsFailed(true));
  };

  useEffect(loadLists, []);

  const toggleList = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubscribe = async () => {
    setSubscribeError(null);
    setSubscribing(true);
    try {
      const detach = (lists ?? []).map((l) => l.id).filter((id) => !selected.includes(id));
      await subscribeToNewsletters(email.trim(), selected, detach, authUser?.firstName ?? undefined);
      setSubscribed(true);
    } catch (err) {
      setSubscribeError(err instanceof Error ? err.message : "Couldn't complete signup.");
    } finally {
      setSubscribing(false);
    }
  };

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

      {tab === 'Saved' && !authUser && (
        <SignInPrompt
          message="Sign in to save articles and find them here."
          onSignIn={() => navigation.navigate('Auth', { mode: 'login' })}
        />
      )}
      {tab === 'Saved' && authUser && (
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

      {tab === 'History' && !authUser && (
        <SignInPrompt
          message="Sign in to keep track of articles you've read."
          onSignIn={() => navigation.navigate('Auth', { mode: 'login' })}
        />
      )}
      {tab === 'History' && authUser && (
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

      {tab === 'Downloads' && !authUser && (
        <SignInPrompt
          message="Sign in to download articles for offline reading."
          onSignIn={() => navigation.navigate('Auth', { mode: 'login' })}
        />
      )}
      {tab === 'Downloads' && authUser && (
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

      {tab === 'Newsletters' &&
        (listsFailed ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <FeedEmptyState title="Couldn't load Newsletters" message="Check your connection and try again." onRetry={loadLists} />
          </View>
        ) : lists === null ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator color={theme.inkMuted} />
          </View>
        ) : lists.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <FeedEmptyState title="No newsletters yet" message="No newsletters have been published for signup yet." />
          </View>
        ) : subscribed ? (
          <View style={{ flex: 1, justifyContent: 'center', padding: space.lg }}>
            <FeedEmptyState title="Preferences saved" message="Check your inbox — a confirmation is on its way." />
          </View>
        ) : (
          <View style={{ padding: space.lg, gap: space.md }}>
            <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
              All newsletters are on by default — turn off any you don't want, then confirm your email.
            </Text>
            {lists.map((list) => {
              const on = selected.includes(list.id);
              return (
                <View
                  key={list.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.md,
                    paddingVertical: space.sm,
                    borderBottomWidth: 1,
                    borderColor: theme.rule,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[type.label, { color: theme.ink }]}>{list.title}</Text>
                    {!!list.description && (
                      <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>{list.description}</Text>
                    )}
                  </View>
                  <Switch value={on} onValueChange={() => toggleList(list.id)} />
                </View>
              );
            })}

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={theme.inkFaint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              style={[
                type.bodyUI,
                {
                  color: theme.ink,
                  borderWidth: 1,
                  borderColor: theme.rule,
                  borderRadius: radius.card,
                  paddingHorizontal: space.md,
                  paddingVertical: space.sm,
                  marginTop: space.sm,
                },
              ]}
            />
            {!!subscribeError && (
              <Text style={[type.caption, { color: theme.marketDown }]}>{subscribeError}</Text>
            )}
            <Button
              label={selected.length === 0 ? 'Unsubscribe from all' : 'Save preferences'}
              onPress={handleSubscribe}
              loading={subscribing}
              disabled={!email.trim()}
            />
          </View>
        ))}
    </SafeAreaView>
  );
}
