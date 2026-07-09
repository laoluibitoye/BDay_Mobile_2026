import React from 'react';
import { FlatList, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { articles, breakingArticle } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReadingHistory'>;
const allArticles = [...articles, breakingArticle];

export function ReadingHistoryScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { readingHistoryIds, clearHistory } = useAppState();
  const history = readingHistoryIds
    .map((id) => allArticles.find((a) => a.id === id))
    .filter((a): a is (typeof allArticles)[number] => !!a);

  return (
    <Screen
      scroll={false}
      header={
        <AppHeader
          variant="compact"
          title="Reading history"
          showBack
          rightAction={history.length ? { icon: 'trash-2', onPress: clearHistory, accessibilityLabel: 'Clear history' } : null}
        />
      }
    >
      <FlatList
        style={{ flex: 1 }}
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
            Articles you open will show up here so you can pick up where you left off.
          </Text>
        }
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
        )}
      />
    </Screen>
  );
}
