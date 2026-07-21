import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, space, type, useTheme } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  numberOfLinesTitle?: number;
  accessibilityLabel?: string;
};

// Shared bordered-card row for "an item in a list" screens (Downloads, Newsletters, Corrections)
// that previously each hand-rolled the same border/radius/bgCard row independently.
export function ListRow({ title, subtitle, meta, onPress, rightElement, numberOfLinesTitle = 2, accessibilityLabel }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { borderColor: theme.rule, backgroundColor: theme.bgCard }]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
    >
      <View style={{ flex: 1 }}>
        <Text style={[type.label, { color: theme.ink }]} numberOfLines={numberOfLinesTitle}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
        {meta && <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.sm }]}>{meta}</Text>}
      </View>
      {rightElement}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: space.md,
  },
});
