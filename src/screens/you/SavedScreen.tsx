import React from 'react';
import { FlatList, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { articles } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Saved'>;

export function SavedScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { savedArticleIds } = useAppState();
  const saved = articles.filter((a) => savedArticleIds.includes(a.id));

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Saved" showBack />}>
      <FlatList
        style={{ flex: 1 }}
        data={saved}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
            Nothing saved yet — tap the bookmark icon on any article to add it here.
          </Text>
        }
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
        )}
      />
    </Screen>
  );
}
