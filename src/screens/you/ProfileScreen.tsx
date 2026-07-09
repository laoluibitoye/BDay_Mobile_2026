import React from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { useAppState } from '../../state/AppState';
import { radius, space, type, useTheme } from '../../theme';

export function ProfileScreen() {
  const { theme } = useTheme();
  const { isSubscribed } = useAppState();

  return (
    <Screen header={<AppHeader variant="compact" title="Profile" showBack />}>
      <View style={{ padding: space.lg }}>
        <View
          style={{
            marginTop: space.lg,
            padding: space.lg,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: theme.rule,
            backgroundColor: theme.bgCard,
            gap: space.md,
          }}
        >
          <Field label="Name" value="Ada Okafor" theme={theme} />
          <Field label="Email" value="ada.okafor@example.com" theme={theme} />
          <Field label="Role" value="Investor" theme={theme} />
          <Field label="Plan" value={isSubscribed ? 'Premium Annual' : 'Free'} theme={theme} />
        </View>
      </View>
    </Screen>
  );
}

function Field({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View>
      <Text style={[type.mono, { color: theme.inkFaint }]}>{label.toUpperCase()}</Text>
      <Text style={[type.bodyUI, { color: theme.ink, marginTop: 2 }]}>{value}</Text>
    </View>
  );
}
