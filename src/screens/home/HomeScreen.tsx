import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { AppBannerSlot } from '../../components/AppBannerSlot';
import { MarketTickerStrip } from '../../components/MarketTickerStrip';
import { SectionTabStrip } from '../../components/SectionTabStrip';
import { HeroArticleCard } from '../../components/HeroArticleCard';
import { HeroCarousel } from '../../components/HeroCarousel';
import { BriefCarouselRail } from '../../components/BriefCarouselRail';
import { SectionLabel } from '../../components/SectionLabel';
import { TileGridRow } from '../../components/TileGridRow';
import { TextListItem } from '../../components/TextListItem';
import { ArticleCard } from '../../components/ArticleCard';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { ToonOfTheDayCard } from '../../components/ToonOfTheDayCard';
import { OffTheClockSection } from '../../components/OffTheClockSection';
import { LatestStoriesModule } from '../../components/LatestStoriesModule';
import { EventsPreviewRow } from '../../components/EventsPreviewRow';
import { EditionsHomeCarousel } from '../../components/EditionsHomeCarousel';
import { Article, TodayModule } from '../../data/types';
import { sections } from '../../data/mock';
import { buildMixedModules } from '../../lib/buildMixedModules';
import { getHomeFeed, getRegisteredArticle, getSectionFeed, HomeSection } from '../../lib/api/content';
import { radius, layout, space, type, useTheme } from '../../theme';

// Today is WP-admin-editable (wp-admin → BusinessDay App → Home Sections — title/category-or-tag
// source/order/post-count-offset per section). The Home sub-tab strip (`HOME_TABS`) is exactly the
// kind of config IMPLEMENTATION_PLAN.md §9.5 plans to move into the WP-admin "App content
// curation" plugin — `sections` is categorical tab-label config, not editorial content, so it
// stays static here until a real WP-admin-editable category list exists.
const HERO_COUNT = 5;
const HOME_TABS = ['Today', ...sections] as const;

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<string>('Today');
  const [wpSections, setWpSections] = useState<HomeSection[] | null>(null);
  const [todayFailed, setTodayFailed] = useState(false);
  const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);
  const [categoryFailed, setCategoryFailed] = useState(false);

  const loadToday = useCallback(() => {
    setTodayFailed(false);
    getHomeFeed()
      .then(setWpSections)
      .catch(() => setTodayFailed(true));
  }, []);

  useEffect(loadToday, [loadToday]);

  const loadCategory = useCallback(() => {
    if (activeTab === 'Today') return;
    setCategoryFailed(false);
    getSectionFeed(slugify(activeTab))
      .then(({ articles }) => setCategoryArticles(articles))
      .catch(() => setCategoryFailed(true));
  }, [activeTab]);

  useEffect(loadCategory, [loadCategory]);

  // Matched by the section's real id ('hero' = Top News), not array position — the carousel must
  // always show the editor's actual Top News picks even if that section isn't sorted first in
  // wp-admin's home-sections order (it previously just grabbed the first 5 articles across ALL
  // sections concatenated, which could silently mix in a different section's content).
  const heroSection = useMemo(() => wpSections?.find((s) => s.id === 'hero') ?? null, [wpSections]);

  const heroSlideArticles: Article[] = useMemo(() => {
    return heroSection ? heroSection.articles.slice(0, HERO_COUNT) : [];
  }, [heroSection]);

  // Each WP section becomes a labeled run of modules, shaped by the editor's chosen display type
  // (wp-admin → BusinessDay App → Home Sections): `mixed` cycles the same variety-generating
  // function category tabs use, the rest force the whole section into one module shape. Top News
  // (the 'hero' section) is pinned first in this scrolling list — directly after the Today's Paper
  // banner above — regardless of where an editor has it ordered in wp-admin, since its carousel
  // already anchors the top of the screen and the rest of its stories should follow immediately,
  // not wherever it happens to fall in the admin-configured order. Its hero-consumed articles are
  // sliced out here so the top stories aren't shown twice in a row.
  const todaySequence: TodayModule[] = useMemo(() => {
    if (!wpSections || wpSections.length === 0) return [];
    const ordered = [...wpSections].sort((a, b) => (a.id === 'hero' ? -1 : b.id === 'hero' ? 1 : 0));
    return ordered.flatMap((section) => {
      const pool = section.id === 'hero' ? section.articles.slice(HERO_COUNT) : section.articles;
      const ids = pool.map((a) => a.id);
      const label = {
        type: 'sectionLabel',
        label: section.label,
        sourceType: section.sourceType,
        sourceValue: section.sourceValue,
      } as TodayModule;
      const sectionModules: TodayModule[] = (() => {
        switch (section.displayType) {
          case 'hero':
            return [label, ...pool.map((a): TodayModule => ({ type: 'hero', articleId: a.id }))];
          case 'cardList':
            return ids.length > 0 ? [label, { type: 'cardList', articleIds: ids } as TodayModule] : [label];
          // briefRail/tileGrid/textList carry their own `label` field for buildMixedModules'
          // synthetic sub-modules (e.g. "More from Economy") rendered inline with no separate
          // header — but a real top-level WP section needs the same "See all →" header every other
          // display type gets, which only the standalone `sectionLabel` module (case 'sectionLabel'
          // below) renders. So the module's own label is blanked out here (falsy → its internal
          // header is skipped) and the real header comes from the prepended `label` module instead.
          case 'briefRail':
            return ids.length > 0 ? [label, { type: 'briefRail', label: '', articleIds: ids } as TodayModule] : [];
          case 'tileGrid':
            return ids.length > 0 ? [label, { type: 'tileGrid', label: '', articleIds: ids } as TodayModule] : [];
          case 'textList':
            if (ids.length === 0) return [];
            // Latest Stories additionally gets an in-place "Load more" (on top of the "See all →"
            // header every section gets) — reader-requested, so older stories can be read without
            // leaving Home, not just via the full archive.
            return section.id === 'latest-stories'
              ? [label, { type: 'latestStories', articleIds: ids } as TodayModule]
              : [label, { type: 'textList', label: '', articleIds: ids } as TodayModule];
          case 'mixed':
          default:
            return [label, ...buildMixedModules(pool, section.label).filter((m) => m.type !== 'hero')];
        }
      })();
      // E-Editions carousel is pinned directly after "BD Investigations" (section id
      // 'investigates') regardless of what comes after it in wp-admin's order — not itself a
      // WP-driven section, so it can't just be given its own position in that order.
      return section.id === 'investigates'
        ? [...sectionModules, { type: 'editionsCarousel' } as TodayModule]
        : sectionModules;
    });
  }, [wpSections]);

  const openArticle = (id: string) => {
    const article = getRegisteredArticle(id);
    if (article?.isLive) {
      navigation.navigate('BreakingNews');
    } else {
      navigation.navigate('ArticleReader', { articleId: id });
    }
  };

  const renderArticle = (id: string): Article | null => getRegisteredArticle(id) ?? null;

  const renderModule = (module: TodayModule) => {
    switch (module.type) {
      case 'hero': {
        const article = renderArticle(module.articleId);
        return article ? <HeroArticleCard article={article} onPress={() => openArticle(module.articleId)} /> : null;
      }
      case 'briefRail': {
        const found = module.articleIds.map(renderArticle).filter((a): a is Article => a !== null);
        return found.length > 0 ? <BriefCarouselRail label={module.label} articles={found} onPressArticle={openArticle} /> : null;
      }
      case 'sectionLabel':
        return (
          <SectionLabel
            label={module.label}
            actionLabel="See all →"
            onPressAction={() =>
              navigation.navigate('SectionFeed', {
                section: module.label,
                sourceType: module.sourceType,
                sourceValue: module.sourceValue,
              })
            }
          />
        );
      case 'cardList':
        return (
          <View style={{ marginBottom: layout.sectionGap - space.lg }}>
            {module.articleIds.map((id) => {
              const article = renderArticle(id);
              return article ? <ArticleCard key={id} article={article} onPress={() => openArticle(id)} /> : null;
            })}
          </View>
        );
      case 'tileGrid': {
        const found = module.articleIds.map(renderArticle).filter((a): a is Article => a !== null);
        return found.length > 0 ? <TileGridRow label={module.label} articles={found} onPressArticle={openArticle} /> : null;
      }
      case 'textList':
        return (
          <View style={{ marginBottom: layout.sectionGap }}>
            {module.label && <SectionLabel label={module.label} />}
            {module.articleIds.map((id, i) => {
              const article = renderArticle(id);
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
      case 'editionsCarousel':
        return <EditionsHomeCarousel />;
      case 'latestStories':
        return <LatestStoriesModule articleIds={module.articleIds} onPressArticle={openArticle} />;
    }
  };

  // Android-specific scroll tuning for these long, image-heavy module lists (100+ articles on
  // non-Today tabs) — `removeClippedSubviews` in particular is an Android-only optimization
  // (detaches offscreen views from the native tree entirely); iOS's own list virtualization
  // doesn't need or reliably benefit from it, so it's gated to avoid any iOS behavior change.
  const listPerfProps = Platform.OS === 'android'
    ? { removeClippedSubviews: true, windowSize: 7, maxToRenderPerBatch: 5, updateCellsBatchingPeriod: 50, initialNumToRender: 4 }
    : {};

  // Taxonomy tabs get the same varied module vocabulary as Today (not a single flat list of
  // cards), cycling hero/brief-rail/tile-grid/text-list/card-list so a large archive doesn't read
  // as one monotonous repeated layout.
  const categoryModules = useMemo(
    () => (activeTab === 'Today' ? [] : buildMixedModules(categoryArticles, activeTab)),
    [activeTab, categoryArticles]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="masthead" />
      <View style={{ marginTop: space.sm }}>
        <MarketTickerStrip />
      </View>
      <View style={{ marginTop: space.sm, borderBottomWidth: 1, borderColor: theme.rule, paddingBottom: space.xs }}>
        <SectionTabStrip items={HOME_TABS} active={activeTab} onSelect={setActiveTab} />
      </View>
      <AppBannerSlot placement="home_top" />

      {activeTab === 'Today' ? (
        todayFailed ? (
          <FeedEmptyState title="Couldn't load the feed" message="Check your connection and try again." onRetry={loadToday} />
        ) : wpSections !== null && todaySequence.length === 0 ? (
          <FeedEmptyState title="Nothing here yet" message="Check back shortly for today's stories." />
        ) : (
          <FlatList<TodayModule>
            {...listPerfProps}
            data={todaySequence}
            keyExtractor={(_, i) => `module-${i}`}
            contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
            ListHeaderComponent={
              heroSlideArticles.length > 0 ? (
                <>
                  <HeroCarousel articles={heroSlideArticles} onPressArticle={openArticle} />
                  <Pressable
                    onPress={() => navigation.navigate('TodaysPaper')}
                    accessibilityRole="button"
                    style={{ marginBottom: layout.sectionGap }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: space.md,
                        padding: space.lg,
                        borderRadius: radius.card,
                        backgroundColor: theme.ink,
                      }}
                    >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: theme.accent,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="newspaper" size={20} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[type.label, { color: theme.bg }]}>Today's Paper</Text>
                      <Text style={[type.caption, { color: theme.inkFaint, marginTop: 2 }]}>
                        The editor-curated print-style edition — read or download
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={theme.bg} />
                    </View>
                  </Pressable>
                  <ToonOfTheDayCard />
                  <EventsPreviewRow />
                  <OffTheClockSection />
                </>
              ) : null
            }
            renderItem={({ item }) => <>{renderModule(item)}</>}
          />
        )
      ) : (
        <FlatList
          {...listPerfProps}
          data={categoryModules}
          keyExtractor={(_, i) => `cat-module-${i}`}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          ListHeaderComponent={
            categoryArticles.length > 0 ? (
              <Pressable
                onPress={() => navigation.navigate('SectionFeed', { section: activeTab })}
                accessibilityRole="button"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: space.lg,
                  marginBottom: layout.sectionGap,
                  borderRadius: radius.card,
                  backgroundColor: theme.ink,
                }}
              >
                <View>
                  <Text style={[type.label, { color: theme.bg }]}>View full {activeTab} archive</Text>
                  <Text style={[type.caption, { color: theme.inkFaint, marginTop: 2 }]}>
                    Every {activeTab} story, newest first — scroll continuously
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={theme.bg} />
              </Pressable>
            ) : null
          }
          ListEmptyComponent={
            categoryFailed ? (
              <FeedEmptyState title="Couldn't load this section" message="Check your connection and try again." onRetry={loadCategory} />
            ) : (
              <FeedEmptyState title="No stories yet" message={`Nothing published in ${activeTab} yet.`} />
            )
          }
          renderItem={({ item }) => <>{renderModule(item)}</>}
        />
      )}
    </SafeAreaView>
  );
}
