import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { glassBlur, space, type, useTheme } from '../theme';

const ICONS: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  Today: 'sun',
  Explore: 'compass',
  WatchListen: 'headphones',
  Games: 'grid',
  Markets: 'trending-up',
};

// design.md §4.1 + §6 "Tab bar (floating, glass)" — floating pill over content, not a docked flat bar.
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const Wrapper = Platform.OS === 'ios' ? BlurView : View;
  const wrapperProps =
    Platform.OS === 'ios'
      ? { intensity: glassBlur.chrome, tint: (mode === 'dark' ? 'dark' : 'light') as 'dark' | 'light' }
      : {};

  return (
    <View style={[styles.container, { bottom: insets.bottom + space.lg }]} pointerEvents="box-none">
      <Wrapper
        {...wrapperProps}
        style={[
          styles.bar,
          {
            borderColor: theme.glassChromeBorder,
            backgroundColor: Platform.OS === 'ios' ? undefined : theme.glassChromeFill,
          },
          Platform.OS === 'ios' && { backgroundColor: theme.glassChromeFill },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = (options.title ?? route.name) as string;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab} hitSlop={8}>
              <View
                style={[
                  styles.iconBackdrop,
                  isFocused && { backgroundColor: theme.accentTint },
                ]}
              >
                <Feather
                  name={ICONS[route.name] ?? 'circle'}
                  size={20}
                  color={isFocused ? theme.ink : theme.inkMuted}
                />
              </View>
              <Text style={[type.caption, { color: isFocused ? theme.ink : theme.inkMuted, marginTop: 2 }]}>
                {label}
              </Text>
              <View style={[styles.dot, { backgroundColor: isFocused ? theme.accent : 'transparent' }]} />
            </Pressable>
          );
        })}
      </Wrapper>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
});
