import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { layout, space, type, useTheme } from '../theme';

type RightAction = {
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  accessibilityLabel: string;
};

type Props = {
  variant: 'masthead' | 'compact';
  title?: string;
  showBack?: boolean;
  rightAction?: RightAction | null; // omit for the default "Settings" icon; pass null to hide the right icon entirely
};

// design.md §6 "App header" — masthead (Home only) / compact (everywhere else).
// Brand assets: app/assets/brand/bd-logo.png, bd-icon.png.
export function AppHeader({ variant, title, showBack, rightAction }: Props) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const goToSettings = () => (navigation as any).navigate('Settings');

  if (variant === 'masthead') {
    return (
      <View style={[styles.mastheadWrap, { borderColor: theme.rule }]}>
        <View style={styles.masthead}>
          <View style={styles.side}>
            <Pressable hitSlop={(layout.touchTarget - 22) / 2} onPress={goToSettings} accessibilityLabel="Settings">
              <Feather name="user" size={22} color={theme.ink} />
            </Pressable>
          </View>
          <View style={styles.center}>
            <Image
              source={require('../../assets/brand/bd-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="BusinessDay"
            />
          </View>
          <View style={[styles.side, styles.sideRight]}>
            <Pressable
              hitSlop={(layout.touchTarget - 22) / 2}
              onPress={() => navigation.navigate('Search' as never)}
              accessibilityLabel="Search"
            >
              <Feather name="search" size={22} color={theme.ink} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.compact, { borderColor: theme.rule }]}>
      <View style={styles.left}>
        {showBack && (
          <Pressable
            hitSlop={(layout.touchTarget - 22) / 2}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            style={styles.back}
          >
            <Feather name="chevron-left" size={22} color={theme.ink} />
          </Pressable>
        )}
        <Image
          source={require('../../assets/brand/bd-icon.png')}
          style={styles.icon}
          resizeMode="contain"
          accessibilityLabel="BusinessDay"
        />
        {title && (
          <Text style={[type.sectionHeadline, { color: theme.ink }]} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
      {rightAction !== null && (
        <View style={styles.rightGroup}>
          {rightAction && (
            <Pressable
              hitSlop={(layout.touchTarget - 22) / 2}
              onPress={rightAction.onPress}
              accessibilityLabel={rightAction.accessibilityLabel}
            >
              <Feather name={rightAction.icon} size={22} color={theme.ink} />
            </Pressable>
          )}
          {/* Settings is never fully replaced by a screen-specific action — it must stay reachable
              from every screen (design.md §6 "App header"), so a custom rightAction is shown
              alongside it, not instead of it. */}
          <Pressable hitSlop={(layout.touchTarget - 22) / 2} onPress={goToSettings} accessibilityLabel="Settings">
            <Feather name="user" size={22} color={theme.ink} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mastheadWrap: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
  },
  masthead: { flexDirection: 'row', alignItems: 'center' },
  side: { width: 40, alignItems: 'flex-start' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  logo: { width: 168, height: 33 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
  },
  compact: { height: 52, borderBottomWidth: 1 },
  left: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 1 },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  back: { marginRight: space.xs },
  icon: { width: 34, height: 34 },
});
