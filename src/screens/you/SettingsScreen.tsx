import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { AppearanceRow } from '../../components/AppearanceRow';
import { MenuRow } from '../../components/MenuRow';
import { SectionLabel } from '../../components/SectionLabel';
import { useAppState } from '../../state/AppState';
import { LANGUAGES } from '../../data/languages';
import { useNotifications } from '../../hooks/useNotifications';
import { useUnreadCommentNotificationCount } from '../../hooks/useCommentNotifications';
import { layout, radius, space, type, useTheme } from '../../theme';

// Account/profile/preferences only — "what you've engaged with" (saved articles, downloads,
// reading history, newsletters) lives in the For You tab instead. See design.md §3.
export function SettingsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { authUser, isSubscribed, language, readNotificationIds, profile } = useAppState();
  const subscription = authUser?.subscription;
  const daysRemaining = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / 86_400_000))
    : null;
  const languageLabel = LANGUAGES.find((l) => l.code === language)?.label ?? language;
  const notifications = useNotifications();
  const unreadCount = (notifications ?? []).filter((n) => !readNotificationIds.includes(n.id)).length;
  const unreadCommentReplies = useUnreadCommentNotificationCount();

  const signOut = () => {
    Alert.alert('Sign out?', "You'll need to sign back in to access your saved articles and subscription.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="Settings" showBack rightAction={null} />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.md,
            marginTop: space.lg,
            padding: space.lg,
            borderRadius: radius.card,
            backgroundColor: isSubscribed ? theme.accentTint : theme.bgCard,
            borderWidth: 1,
            borderColor: theme.rule,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[type.label, { color: theme.bg }]}>
              {profile.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.label, { color: theme.ink }]}>{profile.name}</Text>
            <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
              {isSubscribed ? 'Premium subscriber' : 'Free reader'}
            </Text>
          </View>
          {isSubscribed && subscription && daysRemaining !== null ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[type.label, { color: theme.ink }]}>
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
              </Text>
              <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
                Expires {new Date(subscription.expiresAt).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            !isSubscribed && (
              <Pressable
                onPress={() => navigation.navigate('Paywall')}
                hitSlop={(layout.touchTarget - 20) / 2}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Premium"
              >
                <Text style={[type.label, { color: theme.accent }]}>Upgrade</Text>
              </Pressable>
            )
          )}
        </View>

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="Account" />
        </View>
        <MenuRow icon="user" label="Profile" onPress={() => navigation.navigate('Profile')} />
        <MenuRow
          icon="credit-card"
          label="Subscription"
          value={isSubscribed ? 'Premium' : 'Free'}
          onPress={() => navigation.navigate('ManageSubscription')}
        />
        <MenuRow icon="shield" label="Account & security" onPress={() => navigation.navigate('AccountSecurity')} />
        <MenuRow
          icon="bell"
          label="Notifications"
          value={unreadCount ? String(unreadCount) : undefined}
          onPress={() => navigation.navigate('Notifications')}
        />
        <MenuRow
          icon="sliders"
          label="Notification preferences"
          onPress={() => navigation.navigate('NotificationPreferences')}
        />
        <MenuRow icon="tag" label="Your interests" onPress={() => navigation.navigate('Interests')} />
        <MenuRow icon="gift" label="Refer a friend" onPress={() => navigation.navigate('Referrals')} />
        <MenuRow
          icon="message-circle"
          label="Comment replies"
          value={unreadCommentReplies ? String(unreadCommentReplies) : undefined}
          onPress={() => navigation.navigate('CommentNotifications')}
        />
        <MenuRow icon="message-square" label="My comments" onPress={() => navigation.navigate('MyComments')} />

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="Settings & support" />
        </View>
        <AppearanceRow />
        <MenuRow icon="sliders" label="Feed settings" onPress={() => navigation.navigate('FeedSettings')} />
        <MenuRow icon="globe" label="Language" value={languageLabel} onPress={() => navigation.navigate('Language')} />
        <MenuRow icon="eye" label="Accessibility" onPress={() => navigation.navigate('Accessibility')} />
        <MenuRow icon="wifi" label="Data & offline" onPress={() => navigation.navigate('DataOffline')} />
        <MenuRow icon="flag" label="Edition & region" onPress={() => navigation.navigate('EditionRegion')} />
        <MenuRow icon="help-circle" label="Help Center" onPress={() => navigation.navigate('HelpCenter')} />
        <MenuRow icon="file-text" label="Privacy & Terms" onPress={() => navigation.navigate('PrivacyTerms')} />
        <MenuRow
          icon="edit-3"
          label="Editorial standards"
          onPress={() => navigation.navigate('EditorialStandards')}
        />
        <MenuRow icon="alert-circle" label="Corrections" onPress={() => navigation.navigate('Corrections')} />
        <MenuRow icon="info" label="About" onPress={() => navigation.navigate('About')} />

        <View style={{ marginTop: space.xl }}>
          <MenuRow icon="log-out" label="Sign out" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
