import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShortVideoItem } from '../data/types';
import { shorts } from '../data/mock';
import { space, type } from '../theme';

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`;
  return `${n}`;
}

function durationMs(duration: string): number {
  const [m, s] = duration.split(':').map(Number);
  return ((m || 0) * 60 + (s || 0)) * 1000;
}

const notAvailable = () =>
  Alert.alert('Comments unavailable', "Comments on Shorts aren't available in this preview build yet.");

// design.md §6 — a real YouTube-Shorts-style vertical pager: one video fills the screen, swipe
// up/down for the next, with the standard short-form action rail (like/comment/share/mute) and
// title+description burned onto the frame instead of living in a separate list-row layout.
export function ShortsPlayer() {
  const [containerHeight, setContainerHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [pausedIds, setPausedIds] = useState<Set<string>>(new Set());

  const toggleInSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
    >
      {containerHeight > 0 && (
        <Animated.FlatList
          data={shorts}
          keyExtractor={(item: ShortVideoItem) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={containerHeight}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({ length: containerHeight, offset: containerHeight * index, index })}
          onMomentumScrollEnd={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.y / containerHeight))}
          renderItem={({ item, index }: { item: ShortVideoItem; index: number }) => (
            <ShortSlide
              item={item}
              height={containerHeight}
              isActive={index === activeIndex}
              liked={likedIds.has(item.id)}
              onToggleLike={() => toggleInSet(setLikedIds, item.id)}
              muted={mutedIds.has(item.id)}
              onToggleMute={() => toggleInSet(setMutedIds, item.id)}
              paused={pausedIds.has(item.id)}
              onTogglePause={() => toggleInSet(setPausedIds, item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

function ShortSlide({
  item,
  height,
  isActive,
  liked,
  onToggleLike,
  muted,
  onToggleMute,
  paused,
  onTogglePause,
}: {
  item: ShortVideoItem;
  height: number;
  isActive: boolean;
  liked: boolean;
  onToggleLike: () => void;
  muted: boolean;
  onToggleMute: () => void;
  paused: boolean;
  onTogglePause: () => void;
}) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    if (!isActive || paused) return;
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs(item.duration),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [isActive, paused, item.duration, progress]);

  const railBottom = insets.bottom + 110;

  return (
    <View style={[styles.slide, { height }]}>
      {item.thumbnailUrl && (
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          recyclingKey={item.id}
          cachePolicy="memory-disk"
        />
      )}
      <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={styles.topGradient} pointerEvents="none" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.bottomGradient} pointerEvents="none" />

      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onTogglePause}
        accessibilityRole="button"
        accessibilityLabel={paused ? `Play ${item.title}` : `Pause ${item.title}`}
      >
        {paused && (
          <View style={styles.centerPlay}>
            <Feather name="play" size={60} color="rgba(255,255,255,0.92)" />
          </View>
        )}
      </Pressable>

      <View style={[styles.topRow, { top: insets.top + space.sm }]} pointerEvents="none">
        <View style={styles.shortsBadge}>
          <Feather name="film" size={14} color="#FFFFFF" />
          <Text style={styles.shortsBadgeText}>Shorts</Text>
        </View>
      </View>

      <View style={[styles.rail, { bottom: railBottom }]}>
        <RailButton
          onPress={onToggleLike}
          label={formatCount(item.likeCount + (liked ? 1 : 0))}
          accessibilityLabel={liked ? 'Unlike' : 'Like'}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={30} color={liked ? '#FF3B30' : '#FFFFFF'} />
        </RailButton>
        <RailButton onPress={notAvailable} label={formatCount(item.commentCount)} accessibilityLabel="Comments">
          <Ionicons name="chatbubble-ellipses-outline" size={27} color="#FFFFFF" />
        </RailButton>
        <RailButton
          onPress={() => Share.share({ message: `${item.title} — ${item.channel}` })}
          label="Share"
          accessibilityLabel="Share this short"
        >
          <Ionicons name="arrow-redo-outline" size={28} color="#FFFFFF" />
        </RailButton>
        <RailButton onPress={onToggleMute} accessibilityLabel={muted ? 'Unmute' : 'Mute'}>
          <Feather name={muted ? 'volume-x' : 'volume-2'} size={24} color="#FFFFFF" />
        </RailButton>
      </View>

      <View style={[styles.info, { bottom: railBottom }]} pointerEvents="none">
        <Text style={styles.channel}>@{item.channel.replace(/\s+/g, '')}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
    </View>
  );
}

function RailButton({
  children,
  label,
  onPress,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  label?: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={styles.railButton}>
      {children}
      {label && <Text style={styles.railLabel}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  slide: { width: '100%', backgroundColor: '#000000' },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 260 },
  centerPlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topRow: { position: 'absolute', left: space.lg, right: space.lg, flexDirection: 'row' },
  shortsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: 999,
  },
  shortsBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  rail: { position: 'absolute', right: space.md, alignItems: 'center', gap: space.lg },
  railButton: { alignItems: 'center', gap: 4, minWidth: 44 },
  railLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  info: { position: 'absolute', left: space.lg, right: 88 },
  channel: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  title: { ...type.label, color: '#FFFFFF', marginTop: 6 },
  description: { ...type.caption, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  progressTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  progressFill: { height: 3, backgroundColor: '#FFFFFF' },
});
