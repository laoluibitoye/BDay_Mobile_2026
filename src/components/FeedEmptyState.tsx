import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from './Button';
import { space, type, useTheme } from '../theme';

// Shared by two distinct cases: a real API call that failed/returned nothing (pass `onRetry`),
// and a feature with no backend to call yet (omit `onRetry`) — both render as an honest "nothing
// to show" state rather than any screen falling back to fabricated placeholder content.
export function FeedEmptyState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  const { theme } = useTheme();
  const iconColor = theme.inkFaint;
  const titleColor = theme.ink;
  const messageColor = theme.inkMuted;
  return (
    <View style={styles.container}>
      <Feather name={onRetry ? 'wifi-off' : 'inbox'} size={28} color={iconColor} />
      <Text style={[type.articleHeadline, { color: titleColor, marginTop: space.md, textAlign: 'center' }]}>
        {title}
      </Text>
      <Text style={[type.bodyUI, { color: messageColor, marginTop: space.xs, textAlign: 'center' }]}>
        {message}
      </Text>
      {onRetry && (
        <View style={{ marginTop: space.lg }}>
          <Button label="Retry" variant="secondary" onPress={onRetry} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: space.xl },
});
