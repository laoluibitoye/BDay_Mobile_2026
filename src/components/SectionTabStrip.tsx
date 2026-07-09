import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { space, type, useTheme } from '../theme';

type Props = {
  items: readonly string[];
  active: string;
  onSelect: (item: string) => void;
};

export function SectionTabStrip({ items, active, onSelect }: Props) {
  const { theme } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => {
        const isActive = item === active;
        return (
          <Pressable key={item} onPress={() => onSelect(item)} style={styles.tab}>
            <Text style={[type.label, { color: isActive ? theme.ink : theme.inkMuted }]}>{item}</Text>
            <View
              style={[
                styles.underline,
                { backgroundColor: isActive ? theme.accent : 'transparent' },
              ]}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: space.lg, gap: space.xl },
  tab: { paddingVertical: space.sm, alignItems: 'center' },
  underline: { height: 2, borderRadius: 1, marginTop: space.xs, minWidth: 20, alignSelf: 'stretch' },
});
