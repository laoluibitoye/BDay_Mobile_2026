import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View, ViewToken } from 'react-native';
import { Image } from 'expo-image';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Feather, Ionicons } from '@expo/vector-icons';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import type { VideoItem } from '../../lib/api/videos';
import { space, type } from '../../theme';

type Props = {
  items: VideoItem[];
  failed: boolean;
  onRetry: () => void;
};

// A YouTube-Shorts-style vertical feed: one clip fills the screen, paged with a vertical swipe (no
// autoscroll — the reader always drives it) via `pagingEnabled`. Only the active clip (plus its
// immediate neighbors, for a seamless swipe) actually mounts a WebView — every other row renders
// as a static thumbnail, since a screenful of live YouTube iframes at once would be both wasteful
// and prone to audio bleeding from off-screen clips.
export function ShortsScreen({ items, failed, onRetry }: Props) {
  const { height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 70 }), []);
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable);
    if (first && typeof first.index === 'number') setActiveIndex(first.index);
  }).current;

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: height, offset: height * index, index }),
    [height]
  );

  if (failed) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <FeedEmptyState title="Couldn't load Shorts" message="Check your connection and try again." onRetry={onRetry} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <FeedEmptyState title="No Shorts yet" message="Short clips published on the website will show up here." />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      decelerationRate="fast"
      getItemLayout={getItemLayout}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      renderItem={({ item, index }) => (
        <ShortSlide
          item={item}
          height={height}
          active={index === activeIndex}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
        />
      )}
    />
  );
}

function ShortSlide({
  item,
  height,
  active,
  muted,
  onToggleMute,
}: {
  item: VideoItem;
  height: number;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const { width } = useWindowDimensions();
  // Same real YouTube thumbnail priority as ArticleImage.tsx — every other row in this feed
  // (not just the active one) now shows the clip's actual frame instead of a bare black box with
  // just a play-button hint drawn over nothing.
  const thumbnailUrl = item.imageUrl ?? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`;

  return (
    <View style={{ height, width: '100%', backgroundColor: '#000' }}>
      <Image source={{ uri: thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
      {active && (
        // Bug found live: this used to be a bare WebView pointed straight at a youtube.com/embed
        // URL — the same origin-less embed shape that reliably hit YouTube's "Error 153" for any
        // video with an embedding restriction (see ArticleReaderScreen.tsx/HeroArticleCard.tsx for
        // the full diagnosis). react-native-youtube-iframe + useLocalHTML/baseUrlOverride is the
        // same fix applied there: loads instantly (no external harness fetch) while presenting a
        // legitimate origin YouTube's player actually accepts.
        <YoutubePlayer
          key={muted ? 'muted' : 'unmuted'}
          height={height}
          width={width}
          videoId={item.youtubeId}
          play={active}
          mute={muted}
          useLocalHTML
          baseUrlOverride={process.env.EXPO_PUBLIC_WP_BASE_URL}
          initialPlayerParams={{ loop: true, controls: false, rel: false }}
          webViewProps={{ pointerEvents: 'none' }}
        />
      )}
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.captionBlock} pointerEvents="none">
          <Text style={[type.label, { color: '#FFFFFF' }]} numberOfLines={3}>
            {item.title}
          </Text>
          <Text style={[type.caption, { color: 'rgba(255,255,255,0.75)', marginTop: 2 }]}>{item.section}</Text>
        </View>
        <Pressable
          onPress={onToggleMute}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={muted ? 'Unmute' : 'Mute'}
          style={styles.muteButton}
        >
          <Feather name={muted ? 'volume-x' : 'volume-2'} size={18} color="#FFFFFF" />
        </Pressable>
        {!active && (
          <View style={styles.playHint} pointerEvents="none">
            <Ionicons name="play" size={40} color="rgba(255,255,255,0.85)" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  captionBlock: { padding: space.lg, paddingBottom: space.xxxl },
  muteButton: {
    position: 'absolute',
    top: space.xl,
    right: space.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playHint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
