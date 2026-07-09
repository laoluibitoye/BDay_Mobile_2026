import React, { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { space, type, useTheme } from '../../theme';

const OPTIONS = [
  { key: 'wifiOnly', label: 'Download over Wi-Fi only', note: 'Avoid using mobile data for offline downloads.' },
  { key: 'autoDownloadSaved', label: 'Auto-download saved articles', note: 'Make saved articles available offline automatically.' },
  { key: 'preloadImages', label: 'Preload images', note: 'Load images ahead of time for smoother scrolling.' },
] as const;

export function DataOfflineScreen() {
  const { theme } = useTheme();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    wifiOnly: true,
    autoDownloadSaved: false,
    preloadImages: true,
  });

  return (
    <Screen header={<AppHeader variant="compact" title="Data & offline" showBack />}>
      <View style={{ padding: space.lg }}>
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

        <View style={{ marginTop: space.xl }}>
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginBottom: space.md }]}>
            Downloaded articles and cached images use device storage.
          </Text>
          <Button label="Clear cache" variant="secondary" onPress={() => {}} fullWidth />
        </View>
      </View>
    </Screen>
  );
}
