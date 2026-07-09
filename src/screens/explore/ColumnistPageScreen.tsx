import React from 'react';
import { FlatList, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ArticleCard } from '../../components/ArticleCard';
import { articles, authors, breakingArticle } from '../../data/mock';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ColumnistPage'>;
const allArticles = [...articles, breakingArticle];

// Bio + archive of every post by this columnist — the "byline" archive page.
export function ColumnistPageScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const author = authors.find((a) => a.id === route.params.authorId);
  const byline = allArticles.filter((a) => a.authorId === route.params.authorId);

  return (
    <Screen
      scroll={false}
      header={<AppHeader variant="compact" title={author?.name ?? 'Columnist'} showBack />}
    >
      <FlatList
        style={{ flex: 1 }}
        data={byline}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListHeaderComponent={
          author ? (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xl }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: author.avatarColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={[type.label, { color: '#fff' }]}>
                  {author.name.split(' ').map((n) => n[0]).join('')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.sectionHeadline, { color: theme.ink }]}>{author.name}</Text>
                <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>{author.title}</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>No stories from this byline yet.</Text>
        }
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
        )}
      />
    </Screen>
  );
}
