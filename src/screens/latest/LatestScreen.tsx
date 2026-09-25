import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { HeroArticleCard } from '../../components/HeroArticleCard';
import { BriefCarouselRail } from '../../components/BriefCarouselRail';
import { TileGridRow } from '../../components/TileGridRow';
import { TextListItem } from '../../components/TextListItem';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { FeedLoadingState } from '../../components/FeedLoadingState';
import { Article, TodayModule } from '../../data/types';
import { getTagFeed } from '../../lib/api/content';
import { isConnectivityError, CONNECTIVITY_ERROR_COPY } from '../../lib/api/errors';
import { buildMixedModules } from '../../lib/buildMixedModules';
import { useRefreshOnForeground } from '../../hooks/useRefreshOnForeground';
import { layout, radius, space, type, useTheme } from '../../theme';

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
  const [pool, setPool] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFirstPage = async () => {
    setFailed(false);
    try {
      const { articles: real, hasMore: more } = await getTagFeed('bdrecent', 1);
      setPool(real);
      setPage(1);
      setHasMore(more);
    } catch (err) {
      setFailed(true);
      setOffline(isConnectivityError(err));
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    void loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same reasoning as Home: refetch silently when the reader returns to an already-mounted Latest
  // tab from the background, instead of only ever refreshing on a manual pull.
  useRefreshOnForeground(() => void loadFirstPage());

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFirstPage();
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
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
  const findArticle = (id: string) => poolById.get(id);

  const openArticle = (id: string) => {
    navigation.navigate('ArticleReader', { articleId: id });
  };

  // Rebuilding from the full accumulated pool on every page load is safe here: buildMixedModules
  // is a greedy front-to-back cycle, so earlier items' module boundaries never change — appending
  // a new page only ever adds trailing modules.
  const modules = useMemo(() => buildMixedModules(pool, 'Recent').map(stripModuleLabel), [pool]);

  const renderModule = (module: TodayModule) => {
    switch (module.type) {
      case 'hero': {
        const article = findArticle(module.articleId);
        return article ? <HeroArticleCard article={article} onPress={() => openArticle(module.articleId)} /> : null;
      }
      case 'briefRail': {
        const found = module.articleIds.map(findArticle).filter((a): a is Article => a !== undefined);
        return found.length > 0 ? <BriefCarouselRail articles={found} onPressArticle={openArticle} /> : null;
      }
      case 'sectionLabel':
        return null; // buildMixedModules never emits this type — kept for TodayModule exhaustiveness
      case 'cardList':
        return (
          <View style={{ marginBottom: layout.sectionGap - space.lg }}>
            {module.articleIds.map((id) => {
              const article = findArticle(id);
              return article ? <ArticleCard key={id} article={article} onPress={() => openArticle(id)} /> : null;
            })}
          </View>
        );
      case 'tileGrid': {
        const found = module.articleIds.map(findArticle).filter((a): a is Article => a !== undefined);
        return found.length > 0 ? <TileGridRow articles={found} onPressArticle={openArticle} /> : null;
      }
      case 'textList':
        return (
          <View style={{ marginBottom: layout.sectionGap }}>
            {module.articleIds.map((id, i) => {
              const article = findArticle(id);
              return article ? (
                <TextListItem
                  key={id}
                  article={article}
                  onPress={() => openArticle(id)}
                  showDivider={i < module.articleIds.length - 1}
                />
              ) : null;
            })}
          </View>
        );
    }
  };

  if (!loaded) {
    return <FeedLoadingState />;
  }

  if (failed || pool.length === 0) {
    return failed ? (
      offline ? (
        <FeedEmptyState {...CONNECTIVITY_ERROR_COPY} onRetry={loadFirstPage} />
      ) : (
        <FeedEmptyState title="Couldn't load the feed" message="Something went wrong on our end. Try again shortly." onRetry={loadFirstPage} />
      )
    ) : (
      <FeedEmptyState title="Nothing here yet" message="Check back shortly for the latest stories." />
    );
  }

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.lg, paddingTop: space.md }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.marketUp }} />
        <Text style={[type.caption, { color: theme.inkMuted }]}>Live from businessday.ng — pull to refresh</Text>
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

// No real taxonomy-browse endpoint exists on the WordPress site yet (only the tag/section/search
// feeds used elsewhere in this app) — an honest "not available yet" state rather than a fabricated
// topic cloud/recommendation list.
function ExploreTab() {
  return (
    <FeedEmptyState
      title="Explore is coming soon"
      message="Browsing by topic isn't available yet — check Recent or search for now."
    />
  );
}
