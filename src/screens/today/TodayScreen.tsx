import React from 'react';
import { FlatList, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { MarketTickerStrip } from '../../components/MarketTickerStrip';
import { ArticleCard } from '../../components/ArticleCard';
import { HeroArticleCard } from '../../components/HeroArticleCard';
import { BriefCarouselRail } from '../../components/BriefCarouselRail';
import { SectionLabel } from '../../components/SectionLabel';
import { TileGridRow } from '../../components/TileGridRow';
import { TextListItem } from '../../components/TextListItem';
import { TodayModule } from '../../data/types';
import { articles, breakingArticle, todayModuleSequence } from '../../data/mock';
import { layout, space, useTheme } from '../../theme';

const allArticles = [...articles, breakingArticle];
const findArticle = (id: string) => allArticles.find((a) => a.id === id) ?? articles[0];

export function TodayScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="masthead" />
      <MarketTickerStrip />
      <FlatList
        data={todayModuleSequence}
        keyExtractor={(_, i) => `module-${i}`}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        renderItem={({ item }) => <>{renderModule(item)}</>}
      />
    </SafeAreaView>
  );
}
