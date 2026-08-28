import React, { useEffect, useReducer, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigationRef } from '../navigation/navigationRef';
import { getRegisteredArticle } from '../lib/api/content';
import { getSpeakingState, pauseSpeaking, resumeSpeaking, stopSpeaking, subscribeSpeaking } from '../lib/tts';
import { space, type, useTheme } from '../theme';
import { useBlurTarget } from './BlurTargetContext';
import { HIDDEN_ON_ROUTES } from './GlobalTabBar';

// Reader-reported: starting "Listen to this article" had no pause/stop reachable from anywhere
// except scrolling back to the top of that exact article, and leaving the screen entirely left it
// playing with no way back to the controls at all. This is the fix — one persistent bar, mounted
// once at the root (RootNavigator.tsx) next to GlobalTabBar, visible from any screen for as long
// as something is speaking, gone the moment nothing is (and only from tapping the X — pausing
// keeps it visible; see tts.ts's pauseSpeaking on why that used to look like it vanished).
export function GlobalAudioPlayer() {
  const { theme, mode } = useTheme();
  const blurTarget = useBlurTarget();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState(getSpeakingState());
  useEffect(() => subscribeSpeaking(setState), []);

  // Same imperative-ref pattern GlobalTabBar uses — this is a sibling of Stack.Navigator, not one
  // of its screens, so it has no NavigationContext to read the current route from otherwise.
  const [, forceUpdate] = useReducer((n) => n + 1, 0);
  useEffect(() => navigationRef.addListener('state', forceUpdate), []);

  if (!state) return null;
  if (navigationRef.isReady()) {
    const rootState = navigationRef.getRootState();
    const currentRouteName = rootState?.routes[rootState.index]?.name;
    if (currentRouteName && HIDDEN_ON_ROUTES.has(currentRouteName)) return null;
  }

  const openArticle = () => {
    if (getRegisteredArticle(state.id)) {
      navigationRef.navigate('ArticleReader', { articleId: state.id });
    }
  };

  // Same real-blur treatment as GlobalTabBar (a fixed overlay, never embedded in scrolling
  // content — the live-sampling blur that crashed on Android was specifically GlassSheet's
  // "card" variant sitting *inside* a ScrollView; this bar has the same safe shape as the tab bar
  // it's stacked above, so it gets the same glass rather than a flat fallback fill).
  const wrapperProps =
    Platform.OS === 'android'
      ? {
          blurMethod: 'dimezisBlurViewSdk31Plus' as const,
          blurTarget,
          intensity: 65,
          tint: (mode === 'dark' ? 'dark' : 'light') as 'dark' | 'light',
        }
      : { intensity: 65, tint: (mode === 'dark' ? 'dark' : 'light') as 'dark' | 'light' };
  const fill = mode === 'dark' ? 'rgba(51,51,51,0.55)' : 'rgba(248,249,250,0.55)';

  return (
    <View
      style={[styles.container, { bottom: insets.bottom + space.lg + TAB_BAR_HEIGHT + space.sm }]}
      pointerEvents="box-none"
    >
      <BlurView {...wrapperProps} style={[styles.bar, { borderColor: theme.glassChromeBorder, backgroundColor: fill }]}>
        <Pressable onPress={openArticle} style={styles.titleArea} hitSlop={8}>
          <View style={[styles.iconBackdrop, { backgroundColor: theme.accentTint }]}>
            <Feather name="headphones" size={16} color={theme.ink} />
          </View>
          <Text style={[type.label, { color: theme.ink, marginLeft: space.sm, flex: 1 }]} numberOfLines={1}>
            {state.title}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => (state.isPaused ? resumeSpeaking() : pauseSpeaking())}
          hitSlop={8}
          style={styles.control}
          accessibilityLabel={state.isPaused ? 'Resume' : 'Pause'}
        >
          <Feather name={state.isPaused ? 'play' : 'pause'} size={18} color={theme.ink} />
        </Pressable>
        <Pressable onPress={stopSpeaking} hitSlop={8} style={styles.control} accessibilityLabel="Stop listening">
          <Feather name="x" size={18} color={theme.inkMuted} />
        </Pressable>
      </BlurView>
    </View>
  );
}

// Approximate height of GlobalTabBar's pill (paddingVertical*2 + icon + label + focus dot) — this
// bar stacks directly above it. Not measured via onLayout to keep this simple; a few px of gap
// error either way reads as intentional breathing room, not a bug.
const TAB_BAR_HEIGHT = 76;

const styles = StyleSheet.create({
  container: { position: 'absolute', left: space.lg, right: space.lg, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    gap: space.sm,
  },
  titleArea: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBackdrop: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  control: { paddingHorizontal: space.xs },
});
