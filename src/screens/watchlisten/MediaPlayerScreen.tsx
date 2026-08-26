import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { getPodcasts, type PodcastEpisode } from '../../lib/api/podcasts';
import { getVideos, type VideoItem } from '../../lib/api/videos';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MediaPlayer'>;

// Plays a podcast episode or video inline via WebView — react-native-webview is already a
// dependency (from the earlier captcha work), so this avoids pulling in expo-av/expo-video and
// another native rebuild just to play a Spotify embed or a YouTube clip, both of which are
// iframe-embeddable anyway.
export function MediaPlayerScreen({ route }: Props) {
  const { theme } = useTheme();
  const { kind, id } = route.params;
  const [podcast, setPodcast] = useState<PodcastEpisode | null | undefined>(undefined);
  const [video, setVideo] = useState<VideoItem | null | undefined>(undefined);

  useEffect(() => {
    if (kind === 'podcast') {
      getPodcasts()
        .then((res) => setPodcast(res.items.find((p) => p.id === id) ?? null))
        .catch(() => setPodcast(null));
    } else {
      getVideos()
        .then((res) => setVideo(res.items.find((v) => v.id === id) ?? null))
        .catch(() => setVideo(null));
    }
  }, [kind, id]);

  if (kind === 'podcast') {
    if (podcast === undefined) {
      return <Screen header={<AppHeader variant="compact" title="Podcast" showBack />}>{null}</Screen>;
    }
    if (!podcast) {
      return (
        <Screen header={<AppHeader variant="compact" title="Podcast" showBack />}>
          <FeedEmptyState title="Not found" message="This episode isn't available right now." />
        </Screen>
      );
    }
    return (
      <Screen header={<AppHeader variant="compact" title={podcast.showName || 'Podcast'} showBack />}>
        <View style={{ padding: space.lg }}>
          <Text style={[type.articleHeadline, { color: theme.ink }]}>{podcast.title}</Text>
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>
            {podcast.showName}
            {podcast.duration ? ` · ${podcast.duration}` : ''}
          </Text>
        </View>
        <View style={{ height: 232, marginHorizontal: space.lg, borderRadius: 12, overflow: 'hidden' }}>
          {podcast.embedUrl ? (
            <WebView source={{ uri: podcast.embedUrl }} allowsInlineMediaPlayback />
          ) : podcast.audioUrl ? (
            <WebView
              source={{
                html: `<html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#000"><audio controls autoplay style="width:100%" src="${podcast.audioUrl}"></audio></body></html>`,
              }}
              allowsInlineMediaPlayback
            />
          ) : (
            <FeedEmptyState title="No player available" message="This episode has no audio source." />
          )}
        </View>
        {!!podcast.notes && (
          <Text style={[type.bodyUI, { color: theme.inkMuted, padding: space.lg }]}>{podcast.notes}</Text>
        )}
      </Screen>
    );
  }

  if (video === undefined) {
    return <Screen header={<AppHeader variant="compact" title="Video" showBack />}>{null}</Screen>;
  }
  if (!video) {
    return (
      <Screen header={<AppHeader variant="compact" title="Video" showBack />}>
        <FeedEmptyState title="Not found" message="This video isn't available right now." />
      </Screen>
    );
  }
  return (
    <Screen header={<AppHeader variant="compact" title={video.section || 'Video'} showBack />}>
      <View style={{ height: 220, margin: space.lg, borderRadius: 12, overflow: 'hidden' }}>
        <WebView
          source={{ uri: `https://www.youtube.com/embed/${video.youtubeId}?playsinline=1` }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
      <Text style={[type.articleHeadline, { color: theme.ink, paddingHorizontal: space.lg }]}>{video.title}</Text>
    </Screen>
  );
}
