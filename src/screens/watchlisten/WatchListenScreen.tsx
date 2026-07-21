import React, { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { GlassIconButton } from '../../components/GlassIconButton';
import { ShortsPlayer } from '../../components/ShortsPlayer';
import { podcasts, videos } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

const SUBTABS = ['Podcasts', 'Shorts', 'Videos'] as const;
type SubTab = (typeof SUBTABS)[number];

const notPlayable = () =>
  Alert.alert('Playback unavailable', "Audio and video playback aren't available in this preview build yet.");

export function WatchListenScreen() {
  const { theme } = useTheme();
  const [subTab, setSubTab] = useState<SubTab>('Podcasts');

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

      {subTab === 'Podcasts' && (
        <FlatList
          data={podcasts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={notPlayable}
              accessibilityRole="button"
              accessibilityLabel={`Play ${item.title}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                padding: space.md,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: theme.rule,
                borderLeftWidth: item.isDailyBriefing ? 3 : 1,
                borderLeftColor: item.isDailyBriefing ? theme.accent : theme.rule,
                backgroundColor: theme.bgCard,
                marginBottom: space.md,
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: radius.card, overflow: 'hidden' }}>
                {item.artworkUrl ? (
                  <>
                    <Image
                      source={{ uri: item.artworkUrl }}
                      style={{ width: 48, height: 48 }}
                      contentFit="cover"
                      recyclingKey={item.id}
                      cachePolicy="memory-disk"
                    />
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(17,17,17,0.35)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather name={item.isDailyBriefing ? 'activity' : 'play'} size={18} color="#FFFFFF" />
                    </View>
                  </>
                ) : (
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: item.isDailyBriefing ? theme.accent : theme.ink,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name={item.isDailyBriefing ? 'activity' : 'play'} size={18} color={theme.white} />
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.mono, { color: item.isDailyBriefing ? theme.accentDeep : theme.inkFaint }]}>
                  {item.isDailyBriefing ? 'NOW PLAYING' : item.show.toUpperCase()}
                </Text>
                <Text style={[type.label, { color: theme.ink, marginTop: 2 }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
                  {item.duration} · {item.publishedAt}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {subTab === 'Videos' && (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
          renderItem={({ item }) => (
            <View style={{ marginBottom: space.lg }}>
              <Pressable
                onPress={notPlayable}
                accessibilityRole="button"
                accessibilityLabel={`Play ${item.title}`}
                style={{
                  height: 180,
                  borderRadius: radius.card,
                  backgroundColor: theme.ink,
                  overflow: 'hidden',
                }}
              >
                {item.thumbnailUrl && (
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    contentFit="cover"
                    recyclingKey={item.id}
                    cachePolicy="memory-disk"
                  />
                )}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(17,17,17,0.32)',
                    padding: space.md,
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: space.sm }}>
                    <GlassIconButton name="volume-x" accessibilityLabel="Mute" onPress={notPlayable} />
                    <GlassIconButton name="maximize-2" accessibilityLabel="Expand" onPress={notPlayable} />
                    <GlassIconButton name="share" accessibilityLabel="Share video" onPress={notPlayable} />
                  </View>
                  <View
                    style={{
                      alignSelf: 'center',
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="play" size={22} color={theme.ink} />
                  </View>
                  <Text style={[type.mono, { color: '#FFFFFF' }]}>{item.duration}</Text>
                </View>
              </Pressable>
              <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.sm }]}>
                {item.playlist.toUpperCase()}
              </Text>
              <Text style={[type.label, { color: theme.ink, marginTop: 2 }]}>{item.title}</Text>
              <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>{item.channel}</Text>
            </View>
          )}
        />
      )}

      {subTab === 'Shorts' && <ShortsPlayer />}
    </SafeAreaView>
  );
}
