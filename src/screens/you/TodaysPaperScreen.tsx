import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, SectionList, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { TextListItem } from '../../components/TextListItem';
import { articles, sections, todaysPaperPdfUrl } from '../../data/mock';
import { Article } from '../../data/types';
import { getTodaysPaper } from '../../lib/api/todaysPaper';
import { registerArticle } from '../../lib/api/content';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TodaysPaper'>;

const TODAY_LABEL = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });

const mockEditionSections = sections
  .filter((s) => s !== 'Top Stories')
  .map((section) => ({ title: section, data: articles.filter((a) => a.section === section) }))
  .filter((s) => s.data.length > 0);

export function TodaysPaperScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [editionSections, setEditionSections] = useState<{ title: string; data: Article[] }[]>(mockEditionSections);
  const [pdfUrl, setPdfUrl] = useState(todaysPaperPdfUrl);
  const [editionLabel, setEditionLabel] = useState(TODAY_LABEL);

  useEffect(() => {
    getTodaysPaper()
      .then((paper) => {
        if (paper.sections.length === 0) return; // nothing curated yet — keep the mock edition
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
        if (paper.pdfUrl) setPdfUrl(paper.pdfUrl);
        if (paper.date) {
          setEditionLabel(new Date(paper.date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' }));
        }
      })
      .catch(() => {
        // no configured/reachable WordPress backend — keep the mock edition
      });
  }, []);

  const downloadEpaper = async () => {
    if (!pdfUrl) {
      Alert.alert("Today's Paper", "Today's e-paper hasn't been uploaded yet — check back shortly.");
      return;
    }
    setDownloading(true);
    try {
      await Linking.openURL(pdfUrl);
    } catch {
      Alert.alert('Download failed', "We couldn't open today's e-paper. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Screen
      scroll={false}
      header={<AppHeader variant="compact" title="Today's Paper" showBack />}
    >
      <SectionList
        style={{ flex: 1 }}
        sections={editionSections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListHeaderComponent={
          <>
            <Text style={[type.mono, { color: theme.accentDeep }]}>TODAY'S EDITION</Text>
            <Text style={[type.displayHeadline, { color: theme.ink, marginTop: space.xs, marginBottom: space.lg }]}>
              {editionLabel}
            </Text>
            <Pressable
              onPress={downloadEpaper}
              disabled={downloading}
              accessibilityRole="button"
              accessibilityLabel="Download today's e-paper PDF"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                padding: space.lg,
                borderRadius: radius.card,
                backgroundColor: theme.ink,
                marginBottom: space.lg,
                opacity: downloading ? 0.6 : 1,
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
                <Feather name="download" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: theme.bg }]}>Download today's e-paper</Text>
                <Text style={[type.caption, { color: theme.inkFaint, marginTop: 2 }]}>
                  Full print-style PDF edition, published each morning
                </Text>
              </View>
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
