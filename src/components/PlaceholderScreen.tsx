import React from 'react';
import { Text, View } from 'react-native';
import { Screen } from './Screen';
import { AppHeader } from './AppHeader';
import { space, type, useTheme } from '../theme';

type Props = {
  title: string;
  note?: string;
};

// Used for Should/Could-tier screens outside Phase 1's core walkable path
// (IMPLEMENTATION_PLAN.md §13 Phase 1 scope) — present, on-brand, but intentionally unbuilt.
export function PlaceholderScreen({ title, note }: Props) {
  const { theme } = useTheme();
  return (
    <Screen header={<AppHeader variant="compact" title={title} showBack />}>
      <View style={{ padding: space.lg, paddingTop: space.xxl }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          {note ?? 'Planned for a later phase — see IMPLEMENTATION_PLAN.md.'}
        </Text>
      </View>
    </Screen>
  );
}
