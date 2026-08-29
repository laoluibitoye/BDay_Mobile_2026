import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { space, type, useTheme } from '../theme';

type Props = {
  label: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

// design.md §6 "Section label" — connective tissue between Today feed modules.
export function SectionLabel({ label, actionLabel, onPressAction }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[type.sectionLabel, { color: theme.accentDeep }]}>{label.toUpperCase()}</Text>
      <View style={[styles.rule, { backgroundColor: theme.rule }]} />
      {actionLabel && (
        <Pressable onPress={onPressAction} hitSlop={8}>
          <Text style={[type.sectionLabel, { color: theme.accentDeep }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md },
  rule: { flex: 1, height: 1 },
});
