import React, { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { MarketTickerStrip } from '../../components/MarketTickerStrip';
import { SectionTabStrip } from '../../components/SectionTabStrip';
import { HeroArticleCard } from '../../components/HeroArticleCard';
import { HeroCarousel } from '../../components/HeroCarousel';
import { BriefCarouselRail } from '../../components/BriefCarouselRail';
import { SectionLabel } from '../../components/SectionLabel';
import { TileGridRow } from '../../components/TileGridRow';
import { TextListItem } from '../../components/TextListItem';
import { ArticleCard } from '../../components/ArticleCard';
import { TodayModule } from '../../data/types';
import { articles, breakingArticle, sections, todayModuleSequence } from '../../data/mock';
import { buildMixedModules } from '../../lib/buildMixedModules';
import { radius, layout, space, type, useTheme } from '../../theme';

const allArticles = [...articles, breakingArticle];
const findArticle = (id: string) => allArticles.find((a) => a.id === id) ?? articles[0];

// The lead story is a 5-slide carousel, not a single static hero — editors would pick these five
// from WP-admin the same way `todayModuleSequence` is hand-sequenced; the breaking story anchors
// slide one so live news still leads.
const HERO_SLIDE_IDS = ['art-breaking', 'art-1', 'art-4', 'art-2', 'art-6'];
const heroSlideArticles = HERO_SLIDE_IDS.map(findArticle);

// The Home sub-tab strip (`HOME_TABS`) is exactly the kind of config IMPLEMENTATION_PLAN.md §9.5
// plans to move into the WP-admin "App content curation" plugin — an editor should be able to
// add/reorder/rename these categories without an app release. `sections` stands in for that feed
// until the real WP-admin-editable category list lands.
const HOME_TABS = ['Today', ...sections] as const;

// Editors hand-sequence `todayModuleSequence`; everything after that is auto-filled from the
// generated article pool (round-robin across sections) so "Today" keeps a long, varied scroll
// instead of running dry after six curated modules.
const todayExtensionPool = sections
  .filter((s) => s !== 'Top Stories')
  .flatMap((section) => articles.filter((a) => a.section === section && a.id.startsWith('gen-')).slice(0, 15));
const interleavedExtensionPool = todayExtensionPool
  .map((_, i) => i)
  .sort((a, b) => a % 6 - (b % 6) || a - b)
  .map((i) => todayExtensionPool[i]);
const todayExtensionModules = buildMixedModules(interleavedExtensionPool, 'Today');
// The lead 'hero' module is rendered separately as the `HeroCarousel` above, not in this flat
// list — filtered out here so the breaking story doesn't appear twice.
const fullTodaySequence: TodayModule[] = [...todayModuleSequence, ...todayExtensionModules].filter(
  (m) => m.type !== 'hero'
);

export function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<string>('Today');

  const openArticle = (id: string) => {
    const article = findArticle(id);
    if (article.isLive) {
      navigation.navigate('BreakingNews');
    } else {
      navigation.navigate('ArticleReader', { articleId: id });
    }
  };

  const renderModule = (module: TodayModule) => {
    switch (module.type) {
      case 'hero':
        // Not reached in practice — `fullTodaySequence` filters hero modules out (the lead
        // carousel owns that slot) — kept so `TodayModule`'s switch stays exhaustive.
        return <HeroArticleCard article={findArticle(module.articleId)} onPress={() => openArticle(module.articleId)} />;
      case 'briefRail':
        return (
          <BriefCarouselRail
            label={module.label}
            articles={module.articleIds.map(findArticle)}
            onPressArticle={openArticle}
          />
        );
      case 'sectionLabel':
        return (
          <SectionLabel
            label={module.label}
            actionLabel="See all →"
            onPressAction={() => navigation.navigate('SectionFeed', { section: module.label })}
          />
        );
      case 'cardList':
        return (
          <View style={{ marginBottom: layout.sectionGap - space.lg }}>
            {module.articleIds.map((id) => (
              <ArticleCard key={id} article={findArticle(id)} onPress={() => openArticle(id)} />
            ))}
          </View>
        );
      case 'tileGrid':
        return (
          <TileGridRow label={module.label} articles={module.articleIds.map(findArticle)} onPressArticle={openArticle} />
        );
      case 'textList':
        return (
          <View style={{ marginBottom: layout.sectionGap }}>
            <SectionLabel label={module.label} />
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

  // Android-specific scroll tuning for these long, image-heavy module lists (100+ articles on
  // non-Today tabs) — `removeClippedSubviews` in particular is an Android-only optimization
  // (detaches offscreen views from the native tree entirely); iOS's own list virtualization
  // doesn't need or reliably benefit from it, so it's gated to avoid any iOS behavior change.
  const listPerfProps = Platform.OS === 'android'
    ? { removeClippedSubviews: true, windowSize: 7, maxToRenderPerBatch: 5, updateCellsBatchingPeriod: 50, initialNumToRender: 4 }
    : {};

  const categoryArticles =
    activeTab === 'Today' ? [] : activeTab === 'Top Stories' ? allArticles : allArticles.filter((a) => a.section === activeTab);

  // Taxonomy tabs get the same varied module vocabulary as Today (not a single flat list of
  // cards), cycling hero/brief-rail/tile-grid/text-list/card-list so a 100+ article archive
  // doesn't read as one monotonous repeated layout.
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

      {activeTab === 'Today' ? (
        <FlatList
          {...listPerfProps}
          data={fullTodaySequence}
          keyExtractor={(_, i) => `module-${i}`}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          ListHeaderComponent={
            <>
              <HeroCarousel articles={heroSlideArticles} onPressArticle={openArticle} />
              <Pressable
                onPress={() => navigation.navigate('TodaysPaper')}
                accessibilityRole="button"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  padding: space.lg,
                  marginBottom: layout.sectionGap,
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
                  <Feather name="book-open" size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[type.label, { color: theme.bg }]}>Today's Paper</Text>
                  <Text style={[type.caption, { color: theme.inkFaint, marginTop: 2 }]}>
                    The editor-curated print-style edition — read or download
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={theme.bg} />
              </Pressable>
            </>
          }
          renderItem={({ item }) => <>{renderModule(item)}</>}
        />
      ) : (
        <FlatList
          {...listPerfProps}
          data={categoryModules}
          keyExtractor={(_, i) => `cat-module-${i}`}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          ListHeaderComponent={
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
          }
          ListEmptyComponent={
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xl }]}>
              No stories in this section yet.
            </Text>
          }
          renderItem={({ item }) => <>{renderModule(item)}</>}
        />
      )}
    </SafeAreaView>
  );
}
