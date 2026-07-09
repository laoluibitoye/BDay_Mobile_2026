import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { radius, space, type, useTheme } from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
};

export function Button({ label, onPress, variant = 'primary', fullWidth }: Props) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        fullWidth && { alignSelf: 'stretch' },
        isPrimary
          ? { backgroundColor: pressed ? theme.accentDeep : theme.accent }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.rule },
      ]}
    >
      <Text
        style={[
          type.label,
          { color: isPrimary ? '#fff' : theme.ink, textAlign: 'center' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
