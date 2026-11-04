import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getYourNews, type YourNewsDesk } from '../lib/api/yourNews';
import type { Article } from '../data/types';
import { fontFamily, layout, radius, space, type, useTheme } from '../theme';
import { SectionLabel } from './SectionLabel';
import { ArticleImage } from './ArticleImage';

const DESK_WIDTH = 240;

// "Your News" — an admin-configured set of desks (wp-admin -> BDay Aero Options -> News
// Carousel), each its own category/tag rail of its 5 most recent posts. Mirrors the website's
// Redesign-2026 homepage section exactly: same desks, same order, same posts, however many are
// configured there (no fixed count here — this renders whatever the API returns). Renders
// nothing if no desk currently has any posts, same self-fetch/hide-on-empty pattern as
// OffTheClockSection.
export function YourNewsSection() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [desks, setDesks] = useState<YourNewsDesk[] | null>(null);

  useEffect(() => {
    getYourNews()
      .then(setDesks)
      .catch(() => setDesks([]));
  }, []);

  if (!desks || desks.length === 0) return null;

  const open = (article: Article) => navigation.navigate('ArticleReader', { articleId: article.id });

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionLabel label="Your News" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: space.md }}>
          {desks.map((desk) => (
            <View key={desk.label} style={{ width: DESK_WIDTH }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.sm }}>
                <View style={{ width: 8, height: 8, backgroundColor: theme.accent }} />
                <Text style={[type.mono, { color: theme.ink }]} numberOfLines={1}>
                  {desk.label.toUpperCase()}
                </Text>
              </View>
              <View style={{ gap: space.sm }}>
                {desk.items.map((article, i) => (
                  <Pressable
                    key={article.id}
                    onPress={() => open(article)}
                    accessibilityRole="button"
                    style={[
                      { flexDirection: 'row', gap: space.sm, paddingTop: i === 0 ? 0 : space.sm },
                      i > 0 && { borderTopWidth: 1, borderColor: theme.rule },
                    ]}
                  >
                    <ArticleImage article={article} style={{ width: 56, height: 56, borderRadius: radius.card }} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ fontFamily: fontFamily.uiBold, fontSize: 13, lineHeight: 17, color: theme.ink }}
                        numberOfLines={3}
                      >
                        {article.headline}
                      </Text>
                      <Text style={[type.caption, { color: theme.inkFaint, marginTop: 4 }]}>{article.publishedAt}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
