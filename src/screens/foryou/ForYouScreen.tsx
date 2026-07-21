import React, { useState } from 'react';
import { FlatList, Pressable, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { ListRow } from '../../components/ListRow';
import { articles, breakingArticle, newsletters } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { layout, radius, space, type, useTheme } from '../../theme';

const allArticles = [...articles, breakingArticle];
const TABS = ['Saved', 'History', 'Downloads', 'Newsletters'] as const;
type Tab = (typeof TABS)[number];

// The app's content-interaction hub — everything you've saved, read, downloaded, or
// subscribed to, in one place. Distinct from Settings: this screen is "what you've engaged
// with," Settings is "how the app behaves for you."
export function ForYouScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<Tab>('Saved');
  const {
    savedArticleIds,
    readingHistoryIds,
    clearHistory,
    downloadedArticleIds,
    toggleDownload,
    subscribedNewsletterIds,
    toggleNewsletterSubscription,
  } = useAppState();

  const saved = savedArticleIds.map((id) => allArticles.find((a) => a.id === id)).filter((a): a is (typeof allArticles)[number] => !!a);
  const history = readingHistoryIds.map((id) => allArticles.find((a) => a.id === id)).filter((a): a is (typeof allArticles)[number] => !!a);
  const downloaded = downloadedArticleIds.map((id) => allArticles.find((a) => a.id === id)).filter((a): a is (typeof allArticles)[number] => !!a);

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

      {tab === 'History' && history.length > 0 && (
        <Pressable
          onPress={clearHistory}
          hitSlop={8}
          accessibilityRole="button"
          style={{ alignSelf: 'flex-end', paddingHorizontal: space.lg, paddingTop: space.md }}
        >
          <Text style={[type.caption, { color: theme.accentDeep }]}>Clear history</Text>
        </Pressable>
      )}

      {tab === 'Saved' && (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          ListEmptyComponent={
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xl }]}>
              Nothing saved yet — tap the bookmark icon on any article to add it here.
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
              Articles you open will show up here so you can pick up where you left off.
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
        <FlatList
          data={newsletters}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          renderItem={({ item }) => {
            const subscribed = subscribedNewsletterIds.includes(item.id);
            return (
              <View
                style={{
                  padding: space.lg,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: theme.rule,
                  backgroundColor: theme.bgCard,
                  marginBottom: space.md,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.label, { color: theme.ink }]}>{item.title}</Text>
                    <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: 2 }]}>{item.summary}</Text>
                    <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.sm }]}>
                      {item.sentAt.toUpperCase()}
                    </Text>
                  </View>
                  <Switch
                    value={subscribed}
                    onValueChange={() => toggleNewsletterSubscription(item.id)}
                    trackColor={{ true: theme.accent, false: theme.rule }}
                    accessibilityLabel={subscribed ? `Unsubscribe from ${item.title}` : `Subscribe to ${item.title}`}
                  />
                </View>
                <Pressable
                  onPress={() => navigation.navigate('NewsletterIssue', { newsletterId: item.id })}
                  hitSlop={8}
                  accessibilityRole="button"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.md }}
                >
                  <Text style={[type.label, { color: theme.accentDeep }]}>View latest edition</Text>
                  <Feather name="arrow-right" size={14} color={theme.accentDeep} />
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
