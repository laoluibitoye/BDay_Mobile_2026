import React from 'react';
import { FlatList, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { articles, breakingArticle } from '../../data/mock';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SectionFeed'>;
const allArticles = [...articles, breakingArticle];

// The "archive" view — every post tagged to a category/section, newest first.
export function SectionFeedScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { section } = route.params;
  const feed = section === 'Top Stories' ? allArticles : allArticles.filter((a) => a.section === section);

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title={section} showBack />}>
      <FlatList
        style={{ flex: 1 }}
        data={feed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>No stories in this section yet.</Text>
        }
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
        )}
      />
    </Screen>
  );
}
