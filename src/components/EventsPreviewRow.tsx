import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { SectionLabel } from './SectionLabel';
import { getEvents, type EventItem } from '../lib/api/events';
import { layout, radius, space, type, useTheme } from '../theme';

const PREVIEW_COUNT = 4;

function formatEventDate(item: EventItem): string {
  if (item.dateIso) {
    return new Date(item.dateIso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return item.dateRaw ?? 'TBA';
}

// The real `events` CPT, same source as the website's homepage Events row. Renders nothing if
// there are no events published, same self-fetch/hide-on-empty pattern as MarketTickerStrip.tsx.
export function EventsPreviewRow() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<EventItem[] | null>(null);

  useEffect(() => {
    getEvents()
      .then((res) => setItems(res.items))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionLabel label="Events" actionLabel="See all →" onPressAction={() => navigation.navigate('Events')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }}>
        {items.slice(0, PREVIEW_COUNT).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => navigation.navigate('Events')}
            accessibilityRole="button"
            style={{ width: 200, borderRadius: radius.card, overflow: 'hidden', backgroundColor: theme.bgCard }}
          >
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={{ width: '100%', aspectRatio: 4 / 3 }} />}
            <View style={{ padding: space.sm }}>
              <Text style={[type.caption, { color: theme.accent }]}>{formatEventDate(item)}</Text>
              <Text style={[type.label, { color: theme.ink, marginTop: 2 }]} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
