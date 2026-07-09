import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { space, type, useTheme } from '../theme';

const MODES: { id: 'light' | 'dark' | 'sepia'; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { id: 'light', icon: 'sun' },
  { id: 'dark', icon: 'moon' },
  { id: 'sepia', icon: 'eye' },
];

// Inline theme switcher, in place of a dedicated Appearance screen — switching light/dark/sepia
// is a single tap and doesn't warrant a full navigation stack. Same 3-icon pattern as the
// article reader's ReaderControls, just laid out as a settings row instead of a pill.
export function AppearanceRow() {
  const { theme, mode, setMode } = useTheme();

  return (
    <View style={[styles.row, { borderColor: theme.rule }]}>
      <Feather name="sun" size={18} color={theme.inkMuted} />
      <Text style={[type.bodyUI, { color: theme.ink, flex: 1, marginLeft: space.md }]}>Appearance</Text>
      <View style={styles.toggle}>
        {MODES.map(({ id, icon }) => {
          const active = mode === id;
          return (
            <Pressable
              key={id}
              onPress={() => setMode(id)}
              hitSlop={6}
              style={[
                styles.button,
                { borderColor: theme.rule },
                active && { backgroundColor: theme.accentTint, borderColor: theme.accent },
              ]}
              accessibilityLabel={`${id} mode`}
            >
              <Feather name={icon} size={15} color={active ? theme.accentDeep : theme.inkMuted} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, borderBottomWidth: 1 },
  toggle: { flexDirection: 'row', gap: space.xs },
  button: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
