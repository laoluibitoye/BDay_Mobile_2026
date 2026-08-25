import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, SectionList, Text, View } from 'react-native';
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
import { getArchiveWindow, getEditionDownloadUrl } from '../../lib/api/editions';
import { ApiError } from '../../lib/api/client';
import { radius, space, type, useTheme } from '../../theme';

const ARCHIVE_DAYS_SHOWN = 7;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

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
  const [archiveAccessDays, setArchiveAccessDays] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(isoDate(new Date()));

  const archiveDates = useMemo(
    () => Array.from({ length: ARCHIVE_DAYS_SHOWN }, (_, i) => daysAgo(i)),
    []
  );

  useEffect(() => {
    // Anonymous/no-plan readers just see every past date locked — same fail-closed posture as
    // the entitlement endpoint itself.
    getArchiveWindow()
      .then((w) => setArchiveAccessDays(w.archiveAccessDays))
      .catch(() => setArchiveAccessDays(0));
  }, []);

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

  const isToday = selectedDate === isoDate(new Date());
  const daysBack = Math.round((Date.now() - new Date(selectedDate).getTime()) / (24 * 60 * 60 * 1000));
  const withinArchiveWindow = archiveAccessDays === null ? true : daysBack <= archiveAccessDays;

  const downloadEpaper = async () => {
    if (isToday) {
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
      return;
    }

    if (!withinArchiveWindow) {
      Alert.alert(
        'Outside your plan\'s archive window',
        `Your plan includes ${archiveAccessDays} day${archiveAccessDays === 1 ? '' : 's'} of back issues. Upgrade to go further back.`,
        [{ text: 'OK' }, { text: 'See plans', onPress: () => navigation.navigate('SubscriptionPlans') }]
      );
      return;
    }

    setDownloading(true);
    try {
      const { url } = await getEditionDownloadUrl(selectedDate);
      await Linking.openURL(url);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        Alert.alert('Outside your plan\'s archive window', 'Upgrade to access more back issues.');
      } else if (e instanceof ApiError && e.status === 404) {
        Alert.alert("No edition found", "No e-paper was published for that date.");
      } else {
        Alert.alert('Download failed', "We couldn't open that edition. Please try again.");
      }
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
            <Text style={[type.mono, { color: theme.accentDeep }]}>{isToday ? "TODAY'S EDITION" : 'BACK ISSUE'}</Text>
            <Text style={[type.displayHeadline, { color: theme.ink, marginTop: space.xs, marginBottom: space.lg }]}>
              {isToday ? editionLabel : new Date(selectedDate).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: space.lg }}>
              <View style={{ flexDirection: 'row', gap: space.sm }}>
                {archiveDates.map((d) => {
                  const iso = isoDate(d);
                  const locked = archiveAccessDays !== null && iso !== isoDate(new Date()) &&
                    Math.round((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000)) > archiveAccessDays;
                  const active = iso === selectedDate;
                  return (
                    <Pressable
                      key={iso}
                      onPress={() => setSelectedDate(iso)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active, disabled: false }}
                      style={{
                        paddingVertical: space.sm,
                        paddingHorizontal: space.md,
                        borderRadius: radius.pill,
                        borderWidth: 1,
                        borderColor: active ? theme.accent : theme.rule,
                        backgroundColor: active ? theme.accentTint : theme.bgCard,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {locked && <Feather name="lock" size ={11} color={theme.inkFaint} />}
                      <Text style={[type.caption, { color: active ? theme.accentDeep : theme.ink }]}>
                        {d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric' })}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <Pressable
              onPress={downloadEpaper}
              disabled={downloading}
              accessibilityRole="button"
              accessibilityLabel={isToday ? "Download today's e-paper PDF" : `Download the ${selectedDate} e-paper PDF`}
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
                <Feather name={isToday || withinArchiveWindow ? 'download' : 'lock'} size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: theme.bg }]}>
                  {isToday ? "Download today's e-paper" : 'Download this edition'}
                </Text>
                <Text style={[type.caption, { color: theme.inkFaint, marginTop: 2 }]}>
                  {isToday
                    ? 'Full print-style PDF edition, published each morning'
                    : withinArchiveWindow
                      ? 'Full print-style PDF edition'
                      : `Outside your plan's ${archiveAccessDays ?? 0}-day archive window`}
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
