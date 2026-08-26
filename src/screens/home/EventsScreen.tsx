import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { getEvents, type EventItem } from '../../lib/api/events';
import { radius, space, type, useTheme } from '../../theme';

function formatEventDate(item: EventItem): string {
  if (item.dateIso) {
    return new Date(item.dateIso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return item.dateRaw ?? 'Date to be announced';
}

// The real `events` CPT — same source the website's homepage Events row uses, via
// businessday-app-connector's /events route.
export function EventsScreen() {
  const { theme } = useTheme();
  const [items, setItems] = useState<EventItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    getEvents()
      .then((res) => setItems(res.items))
      .catch(() => setFailed(true));
  };

  useEffect(load, []);

  return (
    <Screen header={<AppHeader variant="compact" title="Events" showBack />}>
      {failed ? (
        <FeedEmptyState title="Couldn't load Events" message="Check your connection and try again." onRetry={load} />
      ) : items === null ? null : items.length === 0 ? (
        <FeedEmptyState title="No events yet" message="No upcoming events have been published yet." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 140 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => WebBrowser.openBrowserAsync(item.registerUrl)}
              accessibilityRole="button"
              style={{ borderRadius: radius.card, overflow: 'hidden', backgroundColor: theme.bgCard }}
            >
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={{ width: '100%', aspectRatio: 16 / 9 }} />}
              <View style={{ padding: space.lg }}>
                <Text style={[type.caption, { color: theme.accent }]}>{formatEventDate(item)}{item.time ? ` · ${item.time}` : ''}</Text>
                <Text style={[type.label, { color: theme.ink, marginTop: space.xs }]}>{item.title}</Text>
                {!!item.venue && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.xs }}>
                    <Feather name="map-pin" size={13} color={theme.inkMuted} />
                    <Text style={[type.bodyUI, { color: theme.inkMuted }]}>{item.venue}</Text>
                  </View>
                )}
                {!!item.excerpt && (
                  <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]} numberOfLines={3}>
                    {item.excerpt}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.md }}>
                  <Text style={[type.label, { color: theme.accentDeep }]}>Register</Text>
                  <Feather name="external-link" size={14} color={theme.accentDeep} />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
