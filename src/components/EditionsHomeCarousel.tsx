import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { getEditionsHomepage, type EditionHomepageCard } from '../lib/api/editions';
import { layout, radius, space, type, useTheme } from '../theme';
import { SectionLabel } from './SectionLabel';

const CARD_WIDTH = 150;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

// Mirrors the theme's own "E-Editions" homepage section (addons/editions/includes/homepage.php)
// — one card per publication taxonomy term, each showing its latest edition — just as a
// horizontal carousel instead of the website's static grid. Renders nothing if there are no
// editions published yet, same self-fetch/hide-on-empty pattern as MarketTickerStrip.tsx.
export function EditionsHomeCarousel() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<EditionHomepageCard[] | null>(null);

  useEffect(() => {
    getEditionsHomepage()
      .then((res) => setItems(res.items))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionLabel label="E-Editions" actionLabel="See all →" onPressAction={() => navigation.navigate('EEditions')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }}>
        {items.map((item) => (
          <Pressable
            key={item.publicationSlug}
            onPress={() => navigation.navigate('EEditions', { publication: item.publicationSlug })}
            accessibilityRole="button"
            style={{ width: CARD_WIDTH }}
          >
            <View
              style={{
                width: '100%',
                aspectRatio: 3 / 4,
                borderRadius: radius.card,
                overflow: 'hidden',
                backgroundColor: theme.bgCard,
                borderWidth: 1,
                borderColor: theme.rule,
              }}
            >
              {item.coverImageUrl && (
                <Image source={{ uri: item.coverImageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              )}
            </View>
            <Text style={[type.label, { color: theme.ink, marginTop: space.sm }]} numberOfLines={1}>
              {item.publicationLabel}
            </Text>
            <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>{formatDate(item.date)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
