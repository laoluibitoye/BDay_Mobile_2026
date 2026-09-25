import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { BriefCarouselRail } from '../../components/BriefCarouselRail';
import { SectionLabel } from '../../components/SectionLabel';
import { TileGridRow } from '../../components/TileGridRow';
import { TextListItem } from '../../components/TextListItem';
import { ArticleCard } from '../../components/ArticleCard';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { FeedLoadingState } from '../../components/FeedLoadingState';
import { ToonOfTheDayCard } from '../../components/ToonOfTheDayCard';
import { OffTheClockSection } from '../../components/OffTheClockSection';
import { LatestStoriesModule } from '../../components/LatestStoriesModule';
import { EventsPreviewRow } from '../../components/EventsPreviewRow';
import { EditionsHomeCarousel } from '../../components/EditionsHomeCarousel';
import { useRefreshOnForeground } from '../../hooks/useRefreshOnForeground';
import { useAppConfig } from '../../hooks/useAppConfig';
import { Article, TodayModule } from '../../data/types';
import { sections } from '../../data/mock';
import { buildMixedModules } from '../../lib/buildMixedModules';
import { getHomeFeed, getRegisteredArticle, getSectionFeed, getTagFeed, HomeSection } from '../../lib/api/content';
import type { HomeTab } from '../../lib/api/appConfig';
import { isConnectivityError, CONNECTIVITY_ERROR_COPY } from '../../lib/api/errors';
import { radius, layout, space, type, useTheme } from '../../theme';

// Today is WP-admin-editable (wp-admin → BusinessDay App → Home Sections — title/category-or-tag
// source/order/post-count-offset per section). The rest of the Home sub-tab strip is editor-
// configured too (wp-admin → BusinessDay App → Home Tabs, each a category or tag slug) — "Today"
// itself is always the fixed first tab, never one of that configured list. `sections` (data/mock)
// is only the fallback shown before that config loads or if an editor hasn't configured any tabs
// yet, so Home is never left with just "Today" and nothing else to switch to.
// The lead story is a single, editorially-pinned post (the connector plugin's 'hero' section
// puts the website's own bday_get_hero_lead() result — the Lead Story Lock pin if one's set,
// else the newest 'bdlead' post — in slot 0), not a rotating set of top stories. It gets its own
// single HeroArticleCard, matching the website's one-lead-story layout; a carousel here could
// show a reader a different "lead" than the one an editor actually locked.
const HERO_COUNT = 1;
const FALLBACK_HOME_TABS: HomeTab[] = sections.map((label) => ({ label, sourceType: 'category', sourceValue: slugify(label) }));

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const appConfig = useAppConfig();
  const [activeTab, setActiveTab] = useState<string>('Today');
  const [wpSections, setWpSections] = useState<HomeSection[] | null>(null);
  const [todayFailed, setTodayFailed] = useState(false);
  const [todayOffline, setTodayOffline] = useState(false);
  // `null` (not just `[]`) so "still loading" and "loaded, this tab genuinely has nothing" are
  // distinguishable — Bug found live: this used to start as `[]` and never reset on tab switch,
  // so both the very first category-tab load AND every subsequent tab switch showed "No stories
  // yet" for a moment (or, switching between two already-loaded tabs, briefly the PREVIOUS tab's
  // stale articles) before the real fetch resolved.
  const [categoryArticles, setCategoryArticles] = useState<Article[] | null>(null);
  const [categoryFailed, setCategoryFailed] = useState(false);
  const [categoryOffline, setCategoryOffline] = useState(false);

  // Bug found live: the deployed /config endpoint doesn't have the homeTabs field yet (this
  // client shipped ahead of that plugin re-upload) — appConfig.homeTabs is `undefined` there, not
  // just an empty array, so `appConfig?.homeTabs.length` still threw. Also covers the case this
  // comment already meant to: an editor clearing every row on Home Tabs falls back to the same
  // built-in default set a fresh/unreachable config would, rather than leaving Home with only
  // "Today" and nothing else to switch to.
  const homeTabs = appConfig?.homeTabs?.length ? appConfig.homeTabs : FALLBACK_HOME_TABS;
  const HOME_TABS = useMemo(() => ['Today', ...homeTabs.map((t) => t.label)], [homeTabs]);
  const activeTabSource = homeTabs.find((t) => t.label === activeTab);

  const loadToday = useCallback(() => {
    setTodayFailed(false);
    getHomeFeed()
      .then(setWpSections)
      .catch((err) => {
        setTodayFailed(true);
        setTodayOffline(isConnectivityError(err));
      });
  }, []);

  useEffect(loadToday, [loadToday]);

  const loadCategory = useCallback(() => {
    if (activeTab === 'Today') return;
    setCategoryArticles(null);
    setCategoryFailed(false);
    // A tag-sourced tab (e.g. an editor picking a tag like `bdlead` rather than a real category)
    // needs the tag feed, not a category archive query that would just return nothing — same
    // sourceType branch SectionFeedScreen.tsx already uses for "See all" on one of these tabs.
    const fetch =
      activeTabSource?.sourceType === 'tag' && activeTabSource.sourceValue
        ? getTagFeed(activeTabSource.sourceValue)
        : getSectionFeed(activeTabSource?.sourceValue || slugify(activeTab));
    fetch
      .then(({ articles }) => setCategoryArticles(articles))
      .catch((err) => {
        setCategoryFailed(true);
        setCategoryOffline(isConnectivityError(err));
      });
  }, [activeTab, activeTabSource]);

  useEffect(loadCategory, [loadCategory]);

  // Reader returns to an already-mounted Home after backgrounding the app — re-fetch silently
  // instead of leaving them staring at whatever was current at launch until they think to pull to
  // refresh.
  useRefreshOnForeground(
    useCallback(() => {
      loadToday();
      loadCategory();
    }, [loadToday, loadCategory])
  );

  // Matched by the section's real id ('hero' = Top News), not array position — the carousel must
  // always show the editor's actual Top News picks even if that section isn't sorted first in
  // wp-admin's home-sections order (it previously just grabbed the first 5 articles across ALL
  // sections concatenated, which could silently mix in a different section's content).
  const heroSection = useMemo(() => wpSections?.find((s) => s.id === 'hero') ?? null, [wpSections]);

  const leadArticle: Article | null = useMemo(() => {
    return heroSection?.articles.slice(0, HERO_COUNT)[0] ?? null;
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
              : [label, { type: 'textList', label: '', articleIds: ids.slice(0, 3) } as TodayModule];
          case 'mixed':
          default:
            // Bug found live: buildMixedModules' first cycle always emits a 'hero' module, which
            // got filtered out here to avoid a second full-bleed hero card mid-feed — but that
            // silently dropped its article entirely, leaving this section's own "See all" header
            // with nothing directly under it. The very next module (briefRail, cycle 1) carries
            // its own "More from {label}" sub-header, which then read as a confusing duplicate of
            // the real header immediately above it with an empty gap in between. Folding the
            // would-be hero into a normal card (instead of dropping it) and blanking every
            // synthetic sub-label (same treatment the briefRail/tileGrid/textList cases above
            // already give a top-level WP section) fixes both: content starts right under the
            // real header, and nothing repeats it.
            return [
              label,
              ...buildMixedModules(pool, section.label).map((m): TodayModule => {
                if (m.type === 'hero') return { type: 'cardList', articleIds: [m.articleId] };
                if (m.type === 'briefRail' || m.type === 'tileGrid' || m.type === 'textList') {
                  return { ...m, label: '' };
                }
                return m;
              }),
            ];
        }
      })();
      // E-Editions carousel is pinned directly after "BD Investigations" (section id
      // 'investigates') regardless of what comes after it in wp-admin's order — not itself a
      // WP-driven section, so it can't just be given its own position in that order.
      if (section.id === 'investigates') {
        return [...sectionModules, { type: 'editionsCarousel' } as TodayModule];
      }
      return sectionModules;
    });
  }, [wpSections]);

  const openArticle = (id: string) => {
    navigation.navigate('ArticleReader', { articleId: id });
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
    () => (activeTab === 'Today' ? [] : buildMixedModules(categoryArticles ?? [], activeTab)),
    [activeTab, categoryArticles]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="masthead" />
      <View style={{ marginTop: space.sm }}>
        <MarketTickerStrip />
      </View>
      <View style={{ marginTop: space.sm, paddingBottom: space.sm }}>
        <SectionTabStrip items={HOME_TABS} active={activeTab} onSelect={setActiveTab} />
      </View>
      <AppBannerSlot placement="home_top" />

      {activeTab === 'Today' ? (
        todayFailed ? (
          todayOffline ? (
            <FeedEmptyState {...CONNECTIVITY_ERROR_COPY} onRetry={loadToday} />
          ) : (
            <FeedEmptyState title="Couldn't load the feed" message="Something went wrong on our end. Try again shortly." onRetry={loadToday} />
          )
        ) : wpSections === null ? (
          <FeedLoadingState />
        ) : todaySequence.length === 0 ? (
          <FeedEmptyState title="Nothing here yet" message="Check back shortly for today's stories." />
        ) : (
          <FlatList<TodayModule>
            {...listPerfProps}
            data={todaySequence}
            keyExtractor={(_, i) => `module-${i}`}
            contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
            ListHeaderComponent={
              leadArticle ? (
                <>
                  <HeroArticleCard article={leadArticle} onPress={() => openArticle(leadArticle.id)} />
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
                        overflow: 'hidden',
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
                    {/* Folded-paper-corner accent, top-right — CSS-triangle trick (no image asset):
                        a darker under-triangle peeks past a lighter over-triangle to fake a
                        curled page corner, echoing print/e-paper affordance for this row only. */}
                    <View pointerEvents="none" style={homeStyles.paperFoldShadow} />
                    <View pointerEvents="none" style={[homeStyles.paperFoldFlap, { borderRightColor: theme.bg }]} />
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
            (categoryArticles?.length ?? 0) > 0 ? (
              <Pressable
                onPress={() =>
                  navigation.navigate('SectionFeed', {
                    section: activeTab,
                    sourceType: activeTabSource?.sourceType,
                    sourceValue: activeTabSource?.sourceValue,
                  })
                }
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
              categoryOffline ? (
                <FeedEmptyState {...CONNECTIVITY_ERROR_COPY} onRetry={loadCategory} />
              ) : (
                <FeedEmptyState title="Couldn't load this section" message="Something went wrong on our end. Try again shortly." onRetry={loadCategory} />
              )
            ) : categoryArticles === null ? (
              <FeedLoadingState />
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

// Classic CSS "ribbon corner" triangle trick, ported to RN's border-width/border-color model:
// a box with only two adjacent border sides given width miters into a diagonal at their corner,
// so coloring just one of those sides (and leaving the rest transparent) yields a solid triangle.
// Two stacked triangles (a larger dark one under a smaller light one, offset by FOLD_SHADOW_INSET)
// fake the shadow line under a curled page corner without needing an image asset.
const FOLD_SIZE = 26;
const FOLD_SHADOW_INSET = 4;
const homeStyles = StyleSheet.create({
  paperFoldShadow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderRightWidth: FOLD_SIZE + FOLD_SHADOW_INSET,
    borderBottomWidth: FOLD_SIZE + FOLD_SHADOW_INSET,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: 'rgba(0,0,0,0.35)',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  paperFoldFlap: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderRightWidth: FOLD_SIZE,
    borderBottomWidth: FOLD_SIZE,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});
