import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { space, type, useTheme } from '../theme';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
};

export function MenuRow({ icon, label, value, onPress }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.row, { borderColor: theme.rule }]}>
      <Feather name={icon} size={18} color={theme.inkMuted} />
      <Text style={[type.bodyUI, { color: theme.ink, flex: 1, marginLeft: space.md }]}>{label}</Text>
      {value && <Text style={[type.caption, { color: theme.inkMuted, marginRight: space.sm }]}>{value}</Text>}
      <Feather name="chevron-right" size={18} color={theme.inkFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, borderBottomWidth: 1 },
});
