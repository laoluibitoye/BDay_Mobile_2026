import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { layout, space, type, useTheme } from '../theme';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function MenuRow({ icon, label, value, onPress, disabled }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.row, { borderColor: theme.rule }]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={value ? `${label}, ${value}` : label}
    >
      <Feather name={disabled ? 'lock' : icon} size={18} color={disabled ? theme.inkFaint : theme.inkMuted} />
      <Text style={[type.bodyUI, { color: disabled ? theme.inkFaint : theme.ink, flex: 1, marginLeft: space.md }]}>
        {label}
      </Text>
      {value && (
        <Text style={[type.caption, { color: theme.inkMuted, marginRight: space.sm }]}>{value}</Text>
      )}
      {!disabled && <Feather name="chevron-right" size={18} color={theme.inkFaint} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.touchTarget,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
  },
});
