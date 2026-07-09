import React, { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { space, type, useTheme } from '../../theme';

const OPTIONS = [
  { key: 'largeTouchTargets', label: 'Larger touch targets', note: 'Increase minimum tap area across the app.' },
  { key: 'reduceMotion', label: 'Reduce motion', note: 'Use simple cross-fades instead of transitions and animations.' },
  { key: 'boldText', label: 'Bold text', note: 'Increase font weight for body copy.' },
  { key: 'screenReaderHints', label: 'Extended VoiceOver/TalkBack hints', note: 'Add more descriptive labels for screen readers.' },
] as const;

export function AccessibilityScreen() {
  const { theme } = useTheme();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    largeTouchTargets: false,
    reduceMotion: false,
    boldText: false,
    screenReaderHints: true,
  });

  return (
    <Screen header={<AppHeader variant="compact" title="Accessibility" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          These settings apply on top of your device's own accessibility settings — see design.md §8 for the
          non-color-signal and touch-target guarantees already built into every screen.
        </Text>

        <View style={{ marginTop: space.xl }}>
          {OPTIONS.map((opt) => (
            <View
              key={opt.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: space.md,
                borderBottomWidth: 1,
                borderColor: theme.rule,
                gap: space.md,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[type.bodyUI, { color: theme.ink }]}>{opt.label}</Text>
                <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>{opt.note}</Text>
              </View>
              <Switch
                value={prefs[opt.key]}
                onValueChange={(v) => setPrefs((p) => ({ ...p, [opt.key]: v }))}
                trackColor={{ true: theme.accent, false: theme.rule }}
              />
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
