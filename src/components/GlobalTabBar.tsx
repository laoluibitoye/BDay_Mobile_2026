import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList } from '../navigation/types';
import { navigationRef } from '../navigation/navigationRef';
import { radius, space, type, useTheme } from '../theme';
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
// navigate to yet) and focused modal takeovers (Search, Paywall) that are meant to be a
// self-contained overlay, not a browsing surface.
// Exported so GlobalAudioPlayer (stacked directly above this bar) hides on the same routes —
// keeps the two persistent overlays' visibility rules from drifting independently.
export const HIDDEN_ON_ROUTES = new Set([
  'Splash',
  'Auth',
  'AccountRecovery',
  'InterestPicker',
  'Search',
  'Paywall',
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

  // Bug found live: on full-bleed content (Shorts' vertical video, an article's final paragraph)
  // the pill sits directly over whatever's underneath it with no way to see that content — the
  // bar has no scroll-awareness of its own (it's rendered once at the root, outside every screen's
  // scroll view) and screens have no way to ask it to get out of the way. Reader-facing fix: let
  // the reader collapse it to a small circle themselves, on any screen, instead of trying to guess
  // per-screen when it's in the way.
  const [collapsed, setCollapsed] = useState(false);

  // Hooks must run unconditionally every render (React's rule), so the "not ready yet" bail-out
  // has to come after every hook call below, not before — `isReady` gates what we DO with the
  // state, not whether we compute it.
  const isReady = navigationRef.isReady();
  const rootState = isReady ? navigationRef.getRootState() : undefined;
  const currentRouteName = rootState?.routes[rootState.index]?.name;
  const mainRoute = rootState?.routes.find((r) => r.name === 'Main');
  const mainState = mainRoute && 'state' in mainRoute ? (mainRoute as any).state : undefined;
  const activeTabName: string =
    mainState && typeof mainState.index === 'number' ? mainState.routeNames[mainState.index] : 'Home';

  // A collapse is a choice about THIS screen, not a standing preference — re-expands automatically
  // the moment the reader navigates anywhere else, so it's never mistaken for "the nav bar is gone
  // now" on the next screen they land on.
  //
  // A `ref` (not another `useState`) tracks the last-seen route on purpose, and it's only ever
  // touched once the route is both visible AND "settled" — two real false-positive sources found
  // live, each of which fired a "the reader navigated" reset before the bar was ever shown for
  // real, wiping out an initial (or restored) collapse:
  //  1. `isReady` flips true while `currentRouteName` is still `Splash` (a HIDDEN_ON_ROUTES entry)
  //     before the boot flow lands on `Main` — comparing during that hidden frame treats the
  //     Splash→Main boot transition itself as a navigation.
  //  2. On `Main`, `mainState` (the nested tab navigator's own state) can still be `undefined` for
  //     a render or two after `currentRouteName` already reads `'Main'`, so `activeTabName` falls
  //     back to the hardcoded `'Home'` default rather than whatever `initialRouteName` actually
  //     resolves to — comparing during that half-resolved frame looks like a same-boot tab switch.
  const isVisibleRoute = isReady && !!currentRouteName && !HIDDEN_ON_ROUTES.has(currentRouteName);
  const mainStateResolved = !!mainState && typeof mainState.index === 'number';
  const routeSettled = isVisibleRoute && (currentRouteName !== 'Main' || mainStateResolved);

  const lastRouteKeyRef = useRef<string | null>(null);
  if (routeSettled) {
    const routeKey = `${currentRouteName}:${activeTabName}`;
    if (lastRouteKeyRef.current === null) {
      lastRouteKeyRef.current = routeKey;
    } else if (lastRouteKeyRef.current !== routeKey) {
      lastRouteKeyRef.current = routeKey;
      if (collapsed) setCollapsed(false);
    }
  }

  if (!isVisibleRoute) return null;

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

  if (collapsed) {
    return (
      <View style={[styles.container, { bottom: insets.bottom + space.lg }]} pointerEvents="box-none">
        <BlurView
          {...wrapperProps}
          style={[styles.collapsedButton, { borderColor: theme.glassChromeBorder, backgroundColor: fill }]}
        >
          <Pressable
            onPress={() => setCollapsed(false)}
            style={styles.collapsedPressable}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Show navigation bar"
          >
            <TabIcon routeName={activeTabName} size={20} color={theme.ink} />
          </Pressable>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { bottom: insets.bottom + space.lg }]} pointerEvents="box-none">
      <View style={styles.barWrapper}>
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
        {/* A small handle peeking above the pill, not a 6th tab-shaped item — keeps the reader
            from ever mistaking "minimize" for a navigation destination. */}
        <Pressable
          onPress={() => setCollapsed(true)}
          style={[styles.collapseHandle, { borderColor: theme.glassChromeBorder, backgroundColor: fill }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Minimize navigation bar"
        >
          <Feather name="chevron-down" size={14} color={theme.inkMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: space.lg, right: space.lg, alignItems: 'center' },
  barWrapper: { width: '100%' },
  bar: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: space.sm,
    paddingHorizontal: space.xs,
  },
  collapseHandle: {
    position: 'absolute',
    top: -14,
    left: '50%',
    marginLeft: -14, // half of width — `alignSelf` has no effect once `position: 'absolute'` takes this out of flex flow
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsedButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  collapsedPressable: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
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
