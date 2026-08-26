import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { radius, space, type, useTheme } from '../../theme';

const SUBTABS = ['Podcasts', 'Shorts', 'Videos'] as const;
type SubTab = (typeof SUBTABS)[number];

// No podcast/video/shorts catalog backend exists yet — this used to render fabricated episode
// lists with picsum.photos thumbnails and fake play/like counts as if a real content library.
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

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <FeedEmptyState title={`${subTab} coming soon`} message="This library isn't available yet." />
      </View>
    </SafeAreaView>
  );
}
