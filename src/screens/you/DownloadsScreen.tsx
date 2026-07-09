import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { articles, breakingArticle } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Downloads'>;
const allArticles = [...articles, breakingArticle];

// Distinct from Saved: this is "available offline right now," not "bookmarked for later."
// Phase 1 stores the flag only — see IMPLEMENTATION_PLAN.md's Data & offline NFR for the real
// on-device file cache this stands in for.
export function DownloadsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { downloadedArticleIds, toggleDownload } = useAppState();
  const downloaded = downloadedArticleIds
    .map((id) => allArticles.find((a) => a.id === id))
    .filter((a): a is (typeof allArticles)[number] => !!a);

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Downloads" showBack />}>
      <FlatList
        style={{ flex: 1 }}
        data={downloaded}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
            Nothing downloaded yet — open an article and use "Download for offline" to add it here.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              padding: space.lg,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: theme.rule,
              backgroundColor: theme.bgCard,
              marginBottom: space.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[type.label, { color: theme.ink }]} numberOfLines={2}>
                {item.headline}
              </Text>
              <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
                {item.readTime} · Available offline
              </Text>
            </View>
            <Pressable onPress={() => toggleDownload(item.id)} hitSlop={8} accessibilityLabel="Remove download">
              <Feather name="trash-2" size={18} color={theme.inkMuted} />
            </Pressable>
          </Pressable>
        )}
      />
    </Screen>
  );
}
