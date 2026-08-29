import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { getVideos, type VideoItem } from '../../lib/api/videos';
import { radius, space, type, useTheme } from '../../theme';
import { ShortsScreen } from './ShortsScreen';

const SUBTABS = ['Shorts', 'Videos'] as const;
type SubTab = (typeof SUBTABS)[number];

// Podcasts moved out to its own top-level nav tab (PodcastsScreen) — this tab is video-only now.
// Both Shorts and regular Videos come from the same `/videos` route (real posts using the theme's
// `video` post format with a YouTube ID) and are split client-side purely by URL shape: a
// youtube.com/shorts/ link marks a clip as a Short — see class-bd-videos-api.php's isShortsUrl().
export function WatchListenScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [subTab, setSubTab] = useState<SubTab>('Shorts');
  const [videos, setVideos] = useState<VideoItem[] | null>(null);
  const [videosFailed, setVideosFailed] = useState(false);

  const loadVideos = () => {
    setVideosFailed(false);
    getVideos()
      .then((res) => setVideos(res.items))
      .catch(() => setVideosFailed(true));
  };

  useEffect(loadVideos, []);

  const shorts = useMemo(() => (videos ?? []).filter((v) => v.isShort), [videos]);
  const longform = useMemo(() => (videos ?? []).filter((v) => !v.isShort), [videos]);

  // Shorts renders full-bleed (no padding/header chrome behind it) — everything else keeps the
  // normal Screen-with-header layout.
  if (subTab === 'Shorts') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <SubTabPicker subTab={subTab} setSubTab={setSubTab} floating />
        <ShortsScreen items={shorts} failed={videosFailed} onRetry={loadVideos} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="Videos" />
      <SubTabPicker subTab={subTab} setSubTab={setSubTab} />

      {videosFailed ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="Couldn't load Videos" message="Check your connection and try again." onRetry={loadVideos} />
        </View>
      ) : videos === null ? null : longform.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="Nothing here yet" message="No videos have been published yet." />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 140 }}>
          {longform.map((v) => (
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
      )}
    </SafeAreaView>
  );
}

function SubTabPicker({
  subTab,
  setSubTab,
  floating,
}: {
  subTab: SubTab;
  setSubTab: (t: SubTab) => void;
  floating?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: space.sm,
        paddingHorizontal: space.lg,
        paddingTop: floating ? space.xxxl : space.md,
        paddingBottom: space.md,
        ...(floating ? { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 } : {}),
      }}
    >
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
              backgroundColor: active ? (floating ? 'rgba(255,255,255,0.9)' : theme.ink) : floating ? 'rgba(0,0,0,0.35)' : theme.bgCard,
              borderWidth: active || floating ? 0 : 1,
              borderColor: theme.rule,
            }}
          >
            <Text style={[type.label, { color: active ? (floating ? '#000000' : theme.bg) : floating ? '#FFFFFF' : theme.ink }]}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
