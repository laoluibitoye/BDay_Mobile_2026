import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { getPodcasts, type PodcastEpisode } from '../../lib/api/podcasts';
import { space, type, useTheme } from '../../theme';

// Split out of the former combined "Watch & Listen" tab into its own top-level nav tab — real
// content sourced from the theme's `podcast` CPT via businessday-app-connector's /podcasts route.
export function PodcastsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [podcasts, setPodcasts] = useState<PodcastEpisode[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    getPodcasts()
      .then((res) => setPodcasts(res.items))
      .catch(() => setFailed(true));
  };

  useEffect(load, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="Podcasts" />
      {failed ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="Couldn't load Podcasts" message="Check your connection and try again." onRetry={load} />
        </View>
      ) : podcasts === null ? null : podcasts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="Nothing here yet" message="No episodes have been published yet." />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 140 }}>
          {podcasts.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => navigation.navigate('MediaPlayer', { kind: 'podcast', id: p.id })}
              accessibilityRole="button"
              style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}
            >
              {p.imageUrl ? (
                <Image source={{ uri: p.imageUrl }} style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: theme.bgCard }} />
              ) : (
                <View style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: theme.bgCard, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="headphones" size={22} color={theme.inkFaint} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: theme.ink }]} numberOfLines={2}>{p.title}</Text>
                <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: 2 }]}>
                  {p.showName}
                  {p.duration ? ` · ${p.duration}` : ''}
                </Text>
              </View>
              <Feather name="play-circle" size={26} color={theme.accent} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
