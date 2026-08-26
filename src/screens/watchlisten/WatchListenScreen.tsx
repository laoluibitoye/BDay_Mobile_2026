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
import { getVideos, type VideoItem } from '../../lib/api/videos';
import { radius, space, type, useTheme } from '../../theme';

const SUBTABS = ['Podcasts', 'Shorts', 'Videos'] as const;
type SubTab = (typeof SUBTABS)[number];

// Podcasts and Videos are real, sourced from the theme's `podcast` CPT and `video` post format
// (businessday-app-connector's /podcasts and /videos routes). Shorts stays an honest empty state
// — there's no real content type behind it on the website, just an off-by-default admin-typed
// video-ID list, not worth a dedicated feed.
export function WatchListenScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [subTab, setSubTab] = useState<SubTab>('Podcasts');
  const [podcasts, setPodcasts] = useState<PodcastEpisode[] | null>(null);
  const [podcastsFailed, setPodcastsFailed] = useState(false);
  const [videos, setVideos] = useState<VideoItem[] | null>(null);
  const [videosFailed, setVideosFailed] = useState(false);

  const loadPodcasts = () => {
    setPodcastsFailed(false);
    getPodcasts()
      .then((res) => setPodcasts(res.items))
      .catch(() => setPodcastsFailed(true));
  };

  const loadVideos = () => {
    setVideosFailed(false);
    getVideos()
      .then((res) => setVideos(res.items))
      .catch(() => setVideosFailed(true));
  };

  useEffect(loadPodcasts, []);
  useEffect(loadVideos, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="Watch & Listen" />
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md }}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {SUBTABS.map((tab) => {
            const active = tab === subTab;
            return (
              <Pressable
                key={tab}
                onPress={() => setSubTab(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={{
                  paddingVertical: space.xs,
                  paddingHorizontal: space.lg,
                  borderRadius: radius.pill,
                  backgroundColor: active ? theme.ink : theme.bgCard,
                  borderWidth: active ? 0 : 1,
                  borderColor: theme.rule,
                }}
              >
                <Text style={[type.label, { color: active ? theme.bg : theme.ink }]}>{tab}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {subTab === 'Shorts' && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="Shorts coming soon" message="This library isn't available yet." />
        </View>
      )}

      {subTab === 'Podcasts' &&
        (podcastsFailed ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <FeedEmptyState title="Couldn't load Podcasts" message="Check your connection and try again." onRetry={loadPodcasts} />
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
        ))}

      {subTab === 'Videos' &&
        (videosFailed ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <FeedEmptyState title="Couldn't load Videos" message="Check your connection and try again." onRetry={loadVideos} />
          </View>
        ) : videos === null ? null : videos.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <FeedEmptyState title="Nothing here yet" message="No videos have been published yet." />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 140 }}>
            {videos.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => navigation.navigate('MediaPlayer', { kind: 'video', id: v.id })}
                accessibilityRole="button"
              >
                <View style={{ aspectRatio: 16 / 9, borderRadius: 10, overflow: 'hidden', backgroundColor: theme.bgCard }}>
                  {v.imageUrl ? (
                    <Image source={{ uri: v.imageUrl }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="film" size={22} color={theme.inkFaint} />
                    </View>
                  )}
                  <View style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -14, marginLeft: -14 }}>
                    <Feather name="play-circle" size={28} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={[type.label, { color: theme.ink, marginTop: space.xs }]} numberOfLines={2}>{v.title}</Text>
                <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: 2 }]}>{v.section}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ))}
    </SafeAreaView>
  );
}
