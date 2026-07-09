import React, { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { space, type, useTheme } from '../../theme';

const CATEGORIES = ['Breaking News', 'Market Moves', 'Weekly Briefing', 'Game & Quiz Reminders'] as const;

export function NotificationPreferencesScreen() {
  const { theme } = useTheme();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    'Breaking News': true,
    'Market Moves': true,
    'Weekly Briefing': true,
    'Game & Quiz Reminders': false,
  });

  return (
    <Screen header={<AppHeader variant="compact" title="Notification Preferences" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Choose what's worth a ping.
        </Text>

        <View style={{ marginTop: space.xl }}>
          {CATEGORIES.map((cat) => (
            <View
              key={cat}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: space.md,
                borderBottomWidth: 1,
                borderColor: theme.rule,
              }}
            >
              <Text style={[type.bodyUI, { color: theme.ink }]}>{cat}</Text>
              <Switch
                value={prefs[cat]}
                onValueChange={(v) => setPrefs((p) => ({ ...p, [cat]: v }))}
                trackColor={{ true: theme.accent, false: theme.rule }}
              />
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
