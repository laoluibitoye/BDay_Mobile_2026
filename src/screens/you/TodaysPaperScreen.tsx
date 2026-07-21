import React, { useState } from 'react';
import { Alert, Linking, Pressable, SectionList, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { TextListItem } from '../../components/TextListItem';
import { articles, sections, todaysPaperPdfUrl } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TodaysPaper'>;

const TODAY_LABEL = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });

export function TodaysPaperScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [downloading, setDownloading] = useState(false);
  const editionSections = sections
    .filter((s) => s !== 'Top Stories')
    .map((section) => ({ title: section, data: articles.filter((a) => a.section === section) }))
    .filter((s) => s.data.length > 0);

  const downloadEpaper = async () => {
    if (!todaysPaperPdfUrl) {
      Alert.alert("Today's Paper", "Today's e-paper hasn't been uploaded yet — check back shortly.");
      return;
    }
    setDownloading(true);
    try {
      await Linking.openURL(todaysPaperPdfUrl);
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
              {TODAY_LABEL}
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
