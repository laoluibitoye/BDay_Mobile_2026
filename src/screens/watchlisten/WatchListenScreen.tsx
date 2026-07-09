import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { GlassIconButton } from '../../components/GlassIconButton';
import { podcasts, videos } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

const SUBTABS = ['Podcasts', 'Shorts', 'Videos'] as const;
type SubTab = (typeof SUBTABS)[number];

export function WatchListenScreen() {
  const { theme } = useTheme();
  const [subTab, setSubTab] = useState<SubTab>('Podcasts');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="Watch & Listen" />
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {SUBTABS.map((tab) => {
            const active = tab === subTab;
            return (
              <Pressable
                key={tab}
                onPress={() => setSubTab(tab)}
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
            <View
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
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: item.isDailyBriefing ? theme.accent : theme.ink,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather
                  name={item.isDailyBriefing ? 'activity' : 'play'}
                  size={18}
                  color={item.isDailyBriefing ? theme.white : theme.bg}
                />
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
            </View>
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
              <View
                style={{
                  height: 180,
                  borderRadius: radius.card,
                  backgroundColor: theme.ink,
                  padding: space.md,
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: space.sm }}>
                  <GlassIconButton name="volume-x" />
                  <GlassIconButton name="maximize-2" />
                  <GlassIconButton name="share" />
                </View>
                <Text style={[type.mono, { color: theme.bg }]}>{item.duration}</Text>
              </View>
              <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.sm }]}>
                {item.playlist.toUpperCase()}
              </Text>
              <Text style={[type.label, { color: theme.ink, marginTop: 2 }]}>{item.title}</Text>
              <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>{item.channel}</Text>
            </View>
          )}
        />
      )}

      {subTab === 'Shorts' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
          <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center' }]}>
            Shorts ships in Phase 5 (Differentiation) — see IMPLEMENTATION_PLAN.md.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
