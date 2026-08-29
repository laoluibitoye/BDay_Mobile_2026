import React, { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { SectionLabel } from '../../components/SectionLabel';
import { getNotificationPreferences, updateNotificationPreferences } from '../../lib/api/notificationPreferences';
import { space, type, useTheme } from '../../theme';

export function NotificationPreferencesScreen() {
  const { theme } = useTheme();

  // Real, account-level preferences — GET/PATCH /me/notification-preferences.
  const [briefEnabled, setBriefEnabled] = useState(false);
  const [commentReplyEmailEnabled, setCommentReplyEmailEnabled] = useState(true);
  // Push is fan-out from followed topics (see FollowsScreen), not per-category — this is the one
  // master on/off switch that actually gates PushTokensService.sendToUsers server-side.
  const [pushEnabled, setPushEnabled] = useState(true);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    getNotificationPreferences()
      .then((p) => {
        setBriefEnabled(p.briefEnabled);
        setCommentReplyEmailEnabled(p.commentReplyEmailEnabled);
        setPushEnabled(p.pushEnabled);
      })
      .catch(() => undefined)
      .finally(() => setPrefsLoaded(true));
  }, []);

  const toggleBrief = (value: boolean) => {
    setBriefEnabled(value);
    updateNotificationPreferences({ briefEnabled: value }).catch(() => setBriefEnabled(!value));
  };

  const toggleCommentReplyEmail = (value: boolean) => {
    setCommentReplyEmailEnabled(value);
    updateNotificationPreferences({ commentReplyEmailEnabled: value }).catch(() => setCommentReplyEmailEnabled(!value));
  };

  const togglePush = (value: boolean) => {
    setPushEnabled(value);
    updateNotificationPreferences({ pushEnabled: value }).catch(() => setPushEnabled(!value));
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
            disabled={!prefsLoaded}
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
            disabled={!prefsLoaded}
            trackColor={{ true: theme.accent, false: theme.rule }}
            accessibilityLabel="Comment reply email"
          />
        </View>

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="Push notifications" />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: space.md,
            marginTop: space.sm,
            borderBottomWidth: 1,
            borderColor: theme.rule,
          }}
        >
          <View style={{ flex: 1, marginRight: space.md }}>
            <Text style={[type.bodyUI, { color: theme.ink }]}>Allow push notifications</Text>
            <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
              New stories from topics you follow, sent to this device. Turn off to stop all push —
              choose what you follow under Interests.
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={togglePush}
            disabled={!prefsLoaded}
            trackColor={{ true: theme.accent, false: theme.rule }}
            accessibilityLabel="Push notifications"
          />
        </View>
      </View>
    </Screen>
  );
}
