import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { useAppState, Edition } from '../../state/AppState';
import { radius, space, type, useTheme } from '../../theme';

const EDITIONS: { id: Edition; label: string; note: string }[] = [
  { id: 'nigeria', label: 'Nigeria', note: 'Local markets, naira FX, and NGX coverage first.' },
  { id: 'africa', label: 'Africa', note: 'Pan-African business news, regional markets.' },
  { id: 'global', label: 'Global', note: 'International markets and world business news.' },
];

export function EditionRegionScreen() {
  const { theme } = useTheme();
  const { edition, setEdition } = useAppState();

  return (
    <Screen header={<AppHeader variant="compact" title="Edition & region" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginBottom: space.lg }]}>
          Choose which edition leads your Today feed. Matches the edition picker from first-run onboarding.
        </Text>
        {EDITIONS.map((e) => {
          const active = edition === e.id;
          return (
            <Pressable
              key={e.id}
              onPress={() => setEdition(e.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, checked: active }}
              accessibilityLabel={e.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                borderWidth: 1,
                borderColor: active ? theme.accent : theme.rule,
                backgroundColor: active ? theme.accentTint : theme.bgCard,
                borderRadius: radius.card,
                padding: space.lg,
                marginBottom: space.md,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: theme.ink }]}>{e.label}</Text>
                <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>{e.note}</Text>
              </View>
              {active && <Feather name="check-circle" size={20} color={theme.accent} />}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
