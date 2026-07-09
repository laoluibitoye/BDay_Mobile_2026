import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { articles, breakingArticle, corrections } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Corrections'>;
const allArticles = [...articles, breakingArticle];

export function CorrectionsScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Corrections & editor's notes" showBack />}>
      <FlatList
        style={{ flex: 1 }}
        data={corrections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListHeaderComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginBottom: space.lg }]}>
            BusinessDay corrects errors transparently. This is the public log of corrections and editor's notes across
            our coverage.
          </Text>
        }
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>No corrections on record.</Text>
        }
        renderItem={({ item }) => {
          const article = allArticles.find((a) => a.id === item.articleId);
          return (
            <Pressable
              onPress={() => article && navigation.navigate('ArticleReader', { articleId: article.id })}
              style={{
                padding: space.lg,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: theme.rule,
                backgroundColor: theme.bgCard,
                marginBottom: space.md,
              }}
            >
              <Text style={[type.mono, { color: theme.inkFaint }]}>{item.date.toUpperCase()}</Text>
              {article && (
                <Text style={[type.label, { color: theme.ink, marginTop: space.xs }]} numberOfLines={2}>
                  {article.headline}
                </Text>
              )}
              <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>{item.note}</Text>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
