import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { layout, radius, space, type, useTheme } from '../theme';

type Mode = 'light' | 'dark' | 'sepia';

const MODES: { id: Mode; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'sepia', label: 'Sepia', icon: 'book-open' },
];

// Header shortcut for the appearance setting: one button showing the current mode's icon, tapping
// it opens a small popup anchored under the button with all three modes to choose from.
export function ThemeToggle() {
  const { theme, mode, setMode } = useTheme();
  const buttonRef = useRef<View>(null);
  const [anchorY, setAnchorY] = useState<number | null>(null);
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];

  const open = () => {
    // Just below the button, right-aligned with the header's own side padding.
    buttonRef.current?.measureInWindow((_x, y, _w, h) => setAnchorY(y + h + space.sm));
  };

  return (
    <>
      <Pressable
        ref={buttonRef}
        hitSlop={(layout.touchTarget - 22) / 2}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`Appearance: ${current.label}. Change`}
      >
        <Feather name={current.icon} size={22} color={theme.ink} />
      </Pressable>

      <Modal visible={anchorY !== null} transparent animationType="fade" onRequestClose={() => setAnchorY(null)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setAnchorY(null)} accessibilityLabel="Close" />
        {anchorY !== null && (
          <View
            style={[
              styles.card,
              { top: anchorY, right: space.lg, backgroundColor: theme.bgCard, borderColor: theme.rule },
            ]}
          >
            {MODES.map(({ id, label, icon }) => {
              const active = mode === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => {
                    setMode(id);
                    setAnchorY(null);
                  }}
                  style={styles.option}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${label} mode`}
                >
                  <View
                    style={[
                      styles.circle,
                      { borderColor: active ? theme.accent : theme.rule },
                      active && { backgroundColor: theme.accentTint },
                    ]}
                  >
                    <Feather name={icon} size={20} color={active ? theme.accentDeep : theme.inkMuted} />
                  </View>
                  <Text style={[type.caption, { color: active ? theme.ink : theme.inkMuted, marginTop: 4 }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
    borderWidth: 1,
    borderRadius: radius.button,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  option: { alignItems: 'center', minWidth: 52 },
  circle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
