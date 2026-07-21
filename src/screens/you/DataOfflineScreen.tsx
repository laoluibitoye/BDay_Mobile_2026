import React from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppState, DataOfflinePrefs } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

const OPTIONS: { key: keyof DataOfflinePrefs; label: string; note: string }[] = [
  { key: 'wifiOnly', label: 'Download over Wi-Fi only', note: 'Avoid using mobile data for offline downloads.' },
  { key: 'autoDownloadSaved', label: 'Auto-download saved articles', note: 'Make saved articles available offline automatically.' },
  { key: 'preloadImages', label: 'Preload images', note: 'Load images ahead of time for smoother scrolling.' },
];

export function DataOfflineScreen() {
  const { theme } = useTheme();
  const { dataOfflinePrefs, setDataOfflinePref, downloadedArticleIds, clearDownloads } = useAppState();

  const clearCache = () => {
    Alert.alert(
      'Clear cache?',
      downloadedArticleIds.length
        ? `This removes ${downloadedArticleIds.length} downloaded article${downloadedArticleIds.length === 1 ? '' : 's'} and cached images from this device.`
        : 'This clears cached images from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear cache',
          style: 'destructive',
          onPress: () => {
            clearDownloads();
            Alert.alert('Cache cleared');
          },
        },
      ]
    );
  };

  return (
    <Screen header={<AppHeader variant="compact" title="Data & offline" showBack />}>
      <View style={{ padding: space.lg }}>
        {OPTIONS.map((opt) => {
          const value = dataOfflinePrefs[opt.key];
          return (
            <Pressable
              key={opt.key}
              onPress={() => setDataOfflinePref(opt.key, !value)}
              accessibilityRole="switch"
              accessibilityState={{ checked: value }}
              accessibilityLabel={opt.label}
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
                value={value}
                onValueChange={(v) => setDataOfflinePref(opt.key, v)}
                trackColor={{ true: theme.accent, false: theme.rule }}
              />
            </Pressable>
          );
        })}

        <View style={{ marginTop: space.xl }}>
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginBottom: space.md }]}>
            Downloaded articles and cached images use device storage.
          </Text>
          <Button label="Clear cache" variant="secondary" onPress={clearCache} fullWidth />
        </View>
      </View>
    </Screen>
  );
}
