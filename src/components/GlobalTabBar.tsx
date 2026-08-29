import React, { useEffect, useReducer } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList } from '../navigation/types';
import { navigationRef } from '../navigation/navigationRef';
import { space, type, useTheme } from '../theme';
import { useBlurTarget } from './BlurTargetContext';

const ICONS: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  Home: 'home',
  WatchListen: 'film',
  Podcasts: 'headphones',
  Latest: 'clock',
  ForYou: 'layers',
};

function TabIcon({ routeName, size, color }: { routeName: string; size: number; color: string }) {
  return <Feather name={ICONS[routeName] ?? 'circle'} size={size} color={color} />;
}

// Podcasts takes the slot the former Games tab used to occupy (Games was retired entirely —
// screens, hook, and API deleted), split out of the former combined "Watch & Listen" tab, which
// is now video-only and relabeled accordingly.
const TABS: { name: keyof MainTabParamList; title: string }[] = [
  { name: 'Home', title: 'Home' },
  { name: 'Latest', title: 'Latest' },
  { name: 'WatchListen', title: 'Videos' },
  { name: 'Podcasts', title: 'Podcasts' },
  { name: 'ForYou', title: 'For You' },
];

// Screens where a persistent bottom tab bar doesn't belong: the splash/auth funnel (nothing to
// navigate to yet) and focused modal takeovers (Search, Paywall, Breaking News) that are meant
// to be a self-contained overlay, not a browsing surface.
// Exported so GlobalAudioPlayer (stacked directly above this bar) hides on the same routes —
// keeps the two persistent overlays' visibility rules from drifting independently.
export const HIDDEN_ON_ROUTES = new Set([
  'Splash',
  'Auth',
  'AccountRecovery',
  'InterestPicker',
  'Search',
  'Paywall',
  'BreakingNews',
]);

// A single persistent floating tab bar rendered once at the root (RootNavigator), above the
// entire stack — not the per-tab-navigator bar React Navigation renders by default (MainTabs
// hides that one). This is what makes the bar reachable from any pushed screen (an article, a
// settings sub-page, a market detail) instead of only from the five top-level tab screens
// themselves — tapping a tab pops back to `Main` and switches its nested tab in one motion.
export function GlobalTabBar() {
  const { theme, mode } = useTheme();
  const blurTarget = useBlurTarget();
  const insets = useSafeAreaInsets();

  // `navigationRef` (not the `useNavigation`/`useNavigationState` hooks) because this bar is
  // rendered as a sibling of Stack.Navigator, not one of its screens — it has no NavigationContext
  // to read from, so it goes through the imperative ref API instead, re-rendering on every
  // navigation state change via the 'state' event.
  const [, forceUpdate] = useReducer((n) => n + 1, 0);
  useEffect(() => navigationRef.addListener('state', forceUpdate), []);

  if (!navigationRef.isReady()) return null;
  const rootState = navigationRef.getRootState();
  const currentRouteName = rootState?.routes[rootState.index]?.name;
  const mainRoute = rootState?.routes.find((r) => r.name === 'Main');
  const mainState = mainRoute && 'state' in mainRoute ? (mainRoute as any).state : undefined;
  const activeTabName: string =
    mainState && typeof mainState.index === 'number' ? mainState.routeNames[mainState.index] : 'Home';

  if (!currentRouteName || HIDDEN_ON_ROUTES.has(currentRouteName)) return null;

  // Real blur on both platforms now — iOS's `UIVisualEffectView` samples whatever's behind it
  // automatically; Android needs `dimezisBlurViewSdk31Plus` (a real native blur, not the old
  // CPU-downsample approach) plus an explicit `blurTarget` naming what to sample, via
  // `BlurTargetView` wrapping the app's content in `RootNavigator`. Falls back to a flat tint
  // (still translucent, just not blurred) on Android 11 and below, where blurring is not tenable.
  const wrapperProps =
    Platform.OS === 'android'
      ? {
          blurMethod: 'dimezisBlurViewSdk31Plus' as const,
          blurTarget,
          intensity: 65,
          tint: (mode === 'dark' ? 'dark' : 'light') as 'dark' | 'light',
        }
      : { intensity: 65, tint: (mode === 'dark' ? 'dark' : 'light') as 'dark' | 'light' };
  // Deliberately more transparent than design.md §4.3's standard `--glass-chrome-fill` (0.72
  // alpha) — the bar sits over content on every screen now, so a lighter fill keeps whatever's
  // underneath more visible, while the (increased) blur intensity keeps the frosted-glass read.
  const fill = mode === 'dark' ? 'rgba(51,51,51,0.55)' : 'rgba(248,249,250,0.55)';

  return (
    <View style={[styles.container, { bottom: insets.bottom + space.lg }]} pointerEvents="box-none">
      <BlurView {...wrapperProps} style={[styles.bar, { borderColor: theme.glassChromeBorder, backgroundColor: fill }]}>
        {TABS.map((tab) => {
          const isFocused = tab.name === activeTabName && currentRouteName === 'Main';

          return (
            <Pressable
              key={tab.name}
              onPress={() => navigationRef.navigate('Main', { screen: tab.name })}
              style={styles.tab}
              hitSlop={8}
              // Default Android ripple fills the whole (rectangular) Pressable bounds, which
              // visually squares off the circular active-tab chip underneath it — this app
              // already signals press/focus via the tint chip and opacity, so the ripple is
              // redundant and actively wrong here.
              android_ripple={{ color: 'transparent' }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.title}
            >
              <View style={[styles.iconBackdrop, isFocused && { backgroundColor: theme.accentTint }]}>
                <TabIcon routeName={tab.name} size={20} color={isFocused ? theme.ink : theme.inkMuted} />
              </View>
              <Text style={[type.caption, { color: isFocused ? theme.ink : theme.inkMuted, marginTop: 2 }]}>
                {tab.title}
              </Text>
              <View style={[styles.dot, { backgroundColor: isFocused ? theme.accent : 'transparent' }]} />
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: space.lg, right: space.lg, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: space.sm,
    paddingHorizontal: space.xs,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  iconBackdrop: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
});
