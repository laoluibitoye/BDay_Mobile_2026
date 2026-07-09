import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { radius, space, type, useTheme } from '../theme';

type ReaderTheme = 'light' | 'dark' | 'sepia';

type Props = {
  fontScale: number;
  onFontScaleChange: (n: number) => void;
  minScale?: number;
  maxScale?: number;
};

const THEME_ICONS: { id: ReaderTheme; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { id: 'light', icon: 'sun' },
  { id: 'dark', icon: 'moon' },
  { id: 'sepia', icon: 'eye' },
];

// design.md §6 "Reader controls" — type-size stepper (local to the reader) + theme toggle
// (calls the app's existing global useTheme().setMode — see design.md §6/A.5, not a separate concept).
export function ReaderControls({ fontScale, onFontScaleChange, minScale = -3, maxScale = 3 }: Props) {
  const { theme, mode, setMode } = useTheme();

  return (
    <View style={[styles.row, { borderColor: theme.rule }]}>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => onFontScaleChange(Math.max(minScale, fontScale - 1))}
          hitSlop={8}
          style={[styles.stepButton, { borderColor: theme.rule }]}
          accessibilityLabel="Decrease text size"
        >
          <Text style={[type.label, { color: theme.ink }]}>A−</Text>
        </Pressable>
        <Pressable
          onPress={() => onFontScaleChange(Math.min(maxScale, fontScale + 1))}
          hitSlop={8}
          style={[styles.stepButton, { borderColor: theme.rule }]}
          accessibilityLabel="Increase text size"
        >
          <Text style={[type.label, { color: theme.ink }]}>A+</Text>
        </Pressable>
      </View>

      <View style={styles.themeToggle}>
        {THEME_ICONS.map(({ id, icon }) => {
          const active = mode === id;
          return (
            <Pressable
              key={id}
              onPress={() => setMode(id)}
              hitSlop={8}
              style={[
                styles.themeButton,
                { borderColor: theme.rule },
                active && { backgroundColor: theme.accentTint, borderColor: theme.accent },
              ]}
              accessibilityLabel={`${id} reading mode`}
            >
              <Feather name={icon} size={16} color={active ? theme.accentDeep : theme.inkMuted} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
    marginTop: space.lg,
  },
  stepper: { flexDirection: 'row', gap: space.xs },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: { flexDirection: 'row', gap: space.xs },
  themeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
