import React, { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { SectionLabel } from '../../components/SectionLabel';
import { getNotificationPreferences, updateNotificationPreferences } from '../../lib/api/notificationPreferences';
import { space, type, useTheme } from '../../theme';

// In-app ping categories — no per-category push-preference endpoint exists server-side yet, so
// these stay local/prototype, same posture as the Downloads tab's offline PDFs.
const CATEGORIES = ['Breaking News', 'Market Moves', 'Weekly Briefing', 'Game & Quiz Reminders'] as const;

export function NotificationPreferencesScreen() {
  const { theme } = useTheme();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    'Breaking News': true,
    'Market Moves': true,
    'Weekly Briefing': true,
    'Game & Quiz Reminders': false,
  });

  // Real, account-level email preferences — GET/PATCH /me/notification-preferences.
  const [briefEnabled, setBriefEnabled] = useState(false);
  const [commentReplyEmailEnabled, setCommentReplyEmailEnabled] = useState(true);
  const [emailPrefsLoaded, setEmailPrefsLoaded] = useState(false);

  useEffect(() => {
    getNotificationPreferences()
      .then((p) => {
        setBriefEnabled(p.briefEnabled);
        setCommentReplyEmailEnabled(p.commentReplyEmailEnabled);
      })
      .catch(() => undefined)
      .finally(() => setEmailPrefsLoaded(true));
  }, []);

  const toggleBrief = (value: boolean) => {
    setBriefEnabled(value);
    updateNotificationPreferences({ briefEnabled: value }).catch(() => setBriefEnabled(!value));
  };

  const toggleCommentReplyEmail = (value: boolean) => {
    setCommentReplyEmailEnabled(value);
    updateNotificationPreferences({ commentReplyEmailEnabled: value }).catch(() => setCommentReplyEmailEnabled(!value));
  };

  return (
    <Screen header={<AppHeader variant="compact" title="Notification Preferences" showBack />}>
      <View style={{ padding: space.lg }}>
        <SectionLabel label="Email" />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: space.md,
            borderBottomWidth: 1,
            borderColor: theme.rule,
          }}
        >
          <View style={{ flex: 1, marginRight: space.md }}>
            <Text style={[type.bodyUI, { color: theme.ink }]}>News Brief</Text>
            <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
              A digest of stories from your followed topics.
            </Text>
          </View>
          <Switch
            value={briefEnabled}
            onValueChange={toggleBrief}
            disabled={!emailPrefsLoaded}
            trackColor={{ true: theme.accent, false: theme.rule }}
            accessibilityLabel="News Brief email"
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: space.md,
            borderBottomWidth: 1,
            borderColor: theme.rule,
          }}
        >
          <View style={{ flex: 1, marginRight: space.md }}>
            <Text style={[type.bodyUI, { color: theme.ink }]}>Comment replies</Text>
            <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
              Email me when someone replies to my comment.
            </Text>
          </View>
          <Switch
            value={commentReplyEmailEnabled}
            onValueChange={toggleCommentReplyEmail}
            disabled={!emailPrefsLoaded}
            trackColor={{ true: theme.accent, false: theme.rule }}
            accessibilityLabel="Comment reply email"
          />
        </View>

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="Push notifications" />
        </View>
        <View style={{ marginTop: space.sm }}>
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
