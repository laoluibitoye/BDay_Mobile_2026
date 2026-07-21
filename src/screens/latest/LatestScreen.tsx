import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, TextInput, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { SectionLabel } from '../../components/SectionLabel';
import { TextListItem } from '../../components/TextListItem';
import { articles, articlesForTaxonomy, breakingArticle, taxonomies, taxonomyFreshnessMinutes } from '../../data/mock';
import { Article } from '../../data/types';
import { minutesAgo } from '../../lib/relativeTime';
import { useAppState } from '../../state/AppState';
import { radius, space, type, useTheme } from '../../theme';

const fullPool = [...articles, breakingArticle];
const TABS = ['Recent', 'Explore'] as const;
type Tab = (typeof TABS)[number];

const NEW_POST_INTERVAL_MS = 20000;

export function LatestScreen() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<Tab>('Recent');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="Latest" />
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

      {tab === 'Recent' ? <RecentTab /> : <ExploreTab />}
    </SafeAreaView>
  );
}

function RecentTab() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const initial = useMemo(
    () => [...fullPool].sort((a, b) => minutesAgo(a.publishedAt) - minutesAgo(b.publishedAt)),
    []
  );
  const [feed, setFeed] = useState(initial);
  const shuffledPool = useRef([...fullPool].sort(() => 0.5 - Math.random()));
  const cursor = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const source = shuffledPool.current[cursor.current % shuffledPool.current.length];
      cursor.current += 1;
      setFeed((prev) => [{ ...source, id: `live-${Date.now()}-${cursor.current}`, publishedAt: 'Just now' }, ...prev].slice(0, 400));
    }, NEW_POST_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.lg, paddingTop: space.md }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.marketUp }} />
        <Text style={[type.caption, { color: theme.inkMuted }]}>Live — updates automatically as new stories publish</Text>
      </View>
      <FlatList
        {...(Platform.OS === 'android'
          ? { removeClippedSubviews: true, windowSize: 7, maxToRenderPerBatch: 6, updateCellsBatchingPeriod: 50, initialNumToRender: 6 }
          : {})}
        data={feed}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        renderItem={({ item, index }) =>
          index % 4 === 3 ? (
            <TextListItem article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
          ) : (
            <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
          )
        }
      />
    </>
  );
}

function ExploreTab() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { taxonomyUsage, recordTaxonomyUse, followedTopics } = useAppState();
  const [query, setQuery] = useState('');

  // Ordered by most-recently-published article in each taxonomy — a real WP taxonomy browser
  // would sort this way too, not by the reader's own history.
  const ordered = useMemo(() => {
    return [...taxonomies].sort((a, b) => taxonomyFreshnessMinutes(a) - taxonomyFreshnessMinutes(b));
  }, []);

  const filtered = ordered.filter((t) => t.toLowerCase().includes(query.trim().toLowerCase()));

  const openTaxonomy = (name: string) => {
    recordTaxonomyUse(name);
    navigation.navigate('SectionFeed', { section: name });
  };

  const recommended = useMemo(() => {
    const seen = new Set<string>();
    const picked: Article[] = [];
    for (const topic of followedTopics) {
      for (const article of articlesForTaxonomy(topic)) {
        if (seen.has(article.id)) continue;
        seen.add(article.id);
        picked.push(article);
        if (picked.length >= 12) break;
      }
      if (picked.length >= 12) break;
    }
    return picked;
  }, [followedTopics]);

  return (
    <FlatList
      style={{ flex: 1 }}
      data={recommended}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
      ListHeaderComponent={
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.sm,
              borderWidth: 1,
              borderColor: theme.rule,
              borderRadius: radius.pill,
              paddingHorizontal: space.lg,
              height: 44,
              backgroundColor: theme.bgCard,
            }}
          >
            <Feather name="search" size={16} color={theme.inkFaint} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search topics…"
              placeholderTextColor={theme.inkFaint}
              style={[type.bodyUI, { flex: 1, color: theme.ink, height: '100%' }]}
              accessibilityLabel="Search the taxonomy cloud"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
                <Feather name="x" size={16} color={theme.inkFaint} />
              </Pressable>
            )}
          </View>

          <Text style={[type.caption, { color: theme.inkMuted, marginTop: space.md }]}>
            {filtered.length} topics — arranged by what's most recently published.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg }}>
            {filtered.map((name, i) => {
              const tier = i < 4 ? 'lg' : i < 14 ? 'md' : 'sm';
              const used = (taxonomyUsage[name]?.count ?? 0) > 0;
              return (
                <Pressable
                  key={name}
                  onPress={() => openTaxonomy(name)}
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${name} archive`}
                  style={{
                    paddingVertical: tier === 'lg' ? space.md : tier === 'md' ? space.sm : space.xs,
                    paddingHorizontal: tier === 'lg' ? space.xl : tier === 'md' ? space.lg : space.md,
                    borderRadius: radius.pill,
                    backgroundColor: used ? theme.accentTint : theme.bgCard,
                    borderWidth: 1,
                    borderColor: used ? theme.accent : theme.rule,
                  }}
                >
                  <Text
                    style={[
                      tier === 'lg' ? type.label : type.caption,
                      { color: used ? theme.accentDeep : theme.ink, fontSize: tier === 'lg' ? 17 : tier === 'md' ? 14 : 12 },
                    ]}
                  >
                    {name}
                  </Text>
                </Pressable>
              );
            })}
            {filtered.length === 0 && (
              <Text style={[type.bodyUI, { color: theme.inkMuted }]}>No topics match "{query}".</Text>
            )}
          </View>

          {recommended.length > 0 && (
            <View style={{ marginTop: space.xxl }}>
              <SectionLabel label="Recommended for you" />
              <Text style={[type.caption, { color: theme.inkMuted, marginBottom: space.md }]}>
                Based on the topics you follow: {followedTopics.join(', ')}
              </Text>
            </View>
          )}
        </>
      }
      renderItem={({ item }) => (
        <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
      )}
    />
  );
}
