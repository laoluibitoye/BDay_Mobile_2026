import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, TextInput, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { HeroArticleCard } from '../../components/HeroArticleCard';
import { BriefCarouselRail } from '../../components/BriefCarouselRail';
import { TileGridRow } from '../../components/TileGridRow';
import { SectionLabel } from '../../components/SectionLabel';
import { TextListItem } from '../../components/TextListItem';
import { articles, articlesForTaxonomy, breakingArticle, taxonomies, taxonomyFreshnessMinutes } from '../../data/mock';
import { Article, TodayModule } from '../../data/types';
import { minutesAgo } from '../../lib/relativeTime';
import { getTagFeed } from '../../lib/api/content';
import { buildMixedModules } from '../../lib/buildMixedModules';
import { useAppState } from '../../state/AppState';
import { layout, radius, space, type, useTheme } from '../../theme';

const fullPool = [...articles, breakingArticle];
const TABS = ['Recent', 'Explore'] as const;
type Tab = (typeof TABS)[number];

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

// Recent is one continuous chronological stream, not editorially grouped like Today — it reuses
// the same magazine-variety module engine (buildMixedModules) so the scroll still reads as a
// magazine, but with the module label headers stripped ("More from Recent" would be misleading
// noise here) and no `label` argument that would otherwise show up in a header.
function stripModuleLabel(module: TodayModule): TodayModule {
  return 'label' in module ? { ...module, label: '' } : module;
}

function RecentTab() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const initial = useMemo(
    () => [...fullPool].sort((a, b) => minutesAgo(a.publishedAt) - minutesAgo(b.publishedAt)),
    []
  );
  const [pool, setPool] = useState<Article[]>(initial);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFirstPage = async () => {
    try {
      const { articles: real, hasMore: more } = await getTagFeed('bdrecent', 1);
      if (real.length > 0) {
        setPool(real);
        setIsLive(true);
        setPage(1);
        setHasMore(more);
      }
    } catch {
      // no configured/reachable WordPress backend — keep showing the mock pool, which is finite
      setHasMore(false);
    }
  };

  useEffect(() => {
    void loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFirstPage();
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!isLive || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { articles: real, hasMore: more } = await getTagFeed('bdrecent', nextPage);
      setPool((prev) => [...prev, ...real]);
      setPage(nextPage);
      setHasMore(more);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const poolById = useMemo(() => new Map(pool.map((a) => [a.id, a] as const)), [pool]);
  const findArticle = (id: string) => poolById.get(id) ?? pool[0];

  const openArticle = (id: string) => {
    const article = findArticle(id);
    if (article.isLive) navigation.navigate('BreakingNews');
    else navigation.navigate('ArticleReader', { articleId: id });
  };

  // Rebuilding from the full accumulated pool on every page load is safe here: buildMixedModules
  // is a greedy front-to-back cycle, so earlier items' module boundaries never change — appending
  // a new page only ever adds trailing modules.
  const modules = useMemo(() => buildMixedModules(pool, 'Recent').map(stripModuleLabel), [pool]);

  const renderModule = (module: TodayModule) => {
    switch (module.type) {
      case 'hero':
        return <HeroArticleCard article={findArticle(module.articleId)} onPress={() => openArticle(module.articleId)} />;
      case 'briefRail':
        return <BriefCarouselRail articles={module.articleIds.map(findArticle)} onPressArticle={openArticle} />;
      case 'sectionLabel':
        return null; // buildMixedModules never emits this type — kept for TodayModule exhaustiveness
      case 'cardList':
        return (
          <View style={{ marginBottom: layout.sectionGap - space.lg }}>
            {module.articleIds.map((id) => (
              <ArticleCard key={id} article={findArticle(id)} onPress={() => openArticle(id)} />
            ))}
          </View>
        );
      case 'tileGrid':
        return <TileGridRow articles={module.articleIds.map(findArticle)} onPressArticle={openArticle} />;
      case 'textList':
        return (
          <View style={{ marginBottom: layout.sectionGap }}>
            {module.articleIds.map((id, i) => (
              <TextListItem
                key={id}
                article={findArticle(id)}
                onPress={() => openArticle(id)}
                showDivider={i < module.articleIds.length - 1}
              />
            ))}
          </View>
        );
    }
  };

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.lg, paddingTop: space.md }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isLive ? theme.marketUp : theme.inkFaint }} />
        <Text style={[type.caption, { color: theme.inkMuted }]}>
          {isLive ? 'Live from businessday.ng — pull to refresh' : 'Preview content — pull to refresh'}
        </Text>
      </View>
      <FlatList<TodayModule>
        {...(Platform.OS === 'android'
          ? { removeClippedSubviews: true, windowSize: 7, maxToRenderPerBatch: 6, updateCellsBatchingPeriod: 50, initialNumToRender: 6 }
          : {})}
        data={modules}
        keyExtractor={(_, i) => `recent-module-${i}`}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginTop: space.lg }} color={theme.accent} /> : null}
        renderItem={({ item }) => <>{renderModule(item)}</>}
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
