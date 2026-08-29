import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, SectionList, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { TextListItem } from '../../components/TextListItem';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { Article } from '../../data/types';
import { getTodaysPaper } from '../../lib/api/todaysPaper';
import { registerArticle } from '../../lib/api/content';
import { DEFAULT_PUBLICATION, getEditionDownloadUrl } from '../../lib/api/editions';
import { ApiError } from '../../lib/api/client';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TodaysPaper'>;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const TODAY_LABEL = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });

// Today's own edition only — anything before today (for e-paper or any other publication) lives
// in EEditionsScreen's real, subscription-gated archive instead of a cramped inline date strip.
export function TodaysPaperScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [loadingAction, setLoadingAction] = useState<'read' | 'download' | null>(null);
  const [editionSections, setEditionSections] = useState<{ title: string; data: Article[] }[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [publication, setPublication] = useState(DEFAULT_PUBLICATION);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [editionLabel, setEditionLabel] = useState(TODAY_LABEL);

  const loadPaper = () => {
    setLoadFailed(false);
    getTodaysPaper()
      .then((paper) => {
        setEditionSections(
          paper.sections.map((s) => ({
            title: s.title,
            data: s.items.map((item) => {
              const article: Article = {
                id: String(item.id),
                headline: item.headline,
                dek: item.dek,
                section: s.title,
                authorId: '',
                authorName: '',
                publishedAt: '',
                contentType: 'news' as const,
                isPremium: item.isPremium,
                readTime: '',
                body: [],
                heroColor: '#B22800',
                sourceUrl: item.link,
              };
              registerArticle(article);
              return article;
            }),
          }))
        );
        setPublication(paper.publication || DEFAULT_PUBLICATION);
        setCoverImageUrl(paper.coverImageUrl);
        if (paper.date) {
          setEditionLabel(new Date(paper.date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' }));
        }
      })
      .catch(() => {
        setEditionSections([]);
        setLoadFailed(true);
      });
  };

  useEffect(loadPaper, []);

  const withTodaysSignedUrl = async (action: 'read' | 'download', onReady: (url: string) => void) => {
    setLoadingAction(action);
    try {
      const { url } = await getEditionDownloadUrl(isoDate(new Date()), publication);
      onReady(url);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        Alert.alert("Today's Paper", "Today's e-paper hasn't been uploaded yet — check back shortly.");
      } else {
        Alert.alert('Something went wrong', "We couldn't open today's e-paper. Please try again.");
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const readEpaper = () => withTodaysSignedUrl('read', (url) => navigation.navigate('FlipBook', { pdfUrl: url }));
  const downloadEpaper = () => withTodaysSignedUrl('download', (url) => void Linking.openURL(url));

  return (
    <Screen
      scroll={false}
      header={<AppHeader variant="compact" title="Today's Paper" showBack />}
    >
      <SectionList
        style={{ flex: 1 }}
        sections={editionSections ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          loadFailed ? (
            <FeedEmptyState title="Couldn't load today's paper" message="Check your connection and try again." onRetry={loadPaper} />
          ) : editionSections !== null ? (
            <FeedEmptyState title="Not curated yet" message="Today's edition hasn't been put together yet — check back shortly." />
          ) : null
        }
        ListHeaderComponent={
          <>
            <Pressable
              onPress={() => navigation.navigate('EEditions', { publication: DEFAULT_PUBLICATION })}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, marginBottom: space.lg }}
            >
              <Text style={[type.label, { color: theme.accentDeep }]}>Past editions</Text>
              <Feather name="chevron-right" size={16} color={theme.accentDeep} />
            </Pressable>

            <Text style={[type.mono, { color: theme.accentDeep }]}>TODAY'S EDITION</Text>
            <Text style={[type.displayHeadline, { color: theme.ink, marginTop: space.xs, marginBottom: space.lg }]}>
              {editionLabel}
            </Text>
            {coverImageUrl && (
              <Image
                source={{ uri: coverImageUrl }}
                style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: radius.card, marginBottom: space.lg }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            )}

            <Pressable
              onPress={readEpaper}
              disabled={loadingAction !== null}
              accessibilityRole="button"
              accessibilityLabel="Read today's e-paper"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                padding: space.lg,
                borderRadius: radius.card,
                backgroundColor: theme.ink,
                marginBottom: space.sm,
                opacity: loadingAction !== null ? 0.6 : 1,
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
                <Text style={[type.label, { color: theme.bg }]}>Read today's e-paper</Text>
                <Text style={[type.caption, { color: theme.inkFaint, marginTop: 2 }]}>
                  Flip through the full print-style edition, published each morning
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={downloadEpaper}
              disabled={loadingAction !== null}
              accessibilityRole="button"
              accessibilityLabel="Download today's e-paper PDF"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: space.xs,
                paddingVertical: space.sm,
                marginBottom: space.lg,
                opacity: loadingAction !== null ? 0.6 : 1,
              }}
            >
              <Feather name="download" size={16} color={theme.inkMuted} />
              <Text style={[type.label, { color: theme.inkMuted }]}>Download PDF instead</Text>
            </Pressable>
          </>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.lg, marginBottom: space.sm }]}>
            {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={({ item, index, section }) => (
          <TextListItem
            article={item}
            onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })}
            showDivider={index < section.data.length - 1}
          />
        )}
      />
    </Screen>
  );
}
