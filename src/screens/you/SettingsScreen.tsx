import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { AppearanceRow } from '../../components/AppearanceRow';
import { Button } from '../../components/Button';
import { MenuRow } from '../../components/MenuRow';
import { SectionLabel } from '../../components/SectionLabel';
import { useAppState } from '../../state/AppState';
import { useNotifications } from '../../hooks/useNotifications';
import { useUnreadCommentNotificationCount } from '../../hooks/useCommentNotifications';
import { layout, radius, space, type, useTheme } from '../../theme';

// Account/profile/preferences only — "what you've engaged with" (saved articles, downloads,
// reading history, newsletters) lives in the For You tab instead. See design.md §3.
export function SettingsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { authUser, isSubscribed, readNotificationIds, profile, logout } = useAppState();
  const subscription = authUser?.subscription;
  const daysRemaining = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / 86_400_000))
    : null;
  const notifications = useNotifications();
  const unreadCount = (notifications ?? []).filter((n) => !readNotificationIds.includes(n.id)).length;
  const unreadCommentReplies = useUnreadCommentNotificationCount();

  const signOut = () => {
    Alert.alert('Sign out?', "You'll need to sign back in to access your saved articles and subscription.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        // Matches the website: signing out drops you back to anonymous browsing on Main, not a
        // forced re-onboarding/sign-in wall. logout() actually clears the session — resetting
        // navigation alone doesn't (previously masked by landing back on a screen that looked
        // signed-out regardless of whether the token was actually cleared).
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        },
      },
    ]);
  };

  // Every row below this line assumes a real account (subscription-service DTOs, not local
  // prefs) — a guest tapping one goes to sign-in instead of a screen that would either show
  // nothing real or, worse, stale mock data left over from before real auth existed.
  const requireAuth = (onAuthed: () => void) => {
    if (authUser) {
      onAuthed();
    } else {
      navigation.navigate('Auth', { mode: 'login' });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="Settings" showBack rightAction={null} />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}>
        {authUser ? (
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
        ) : (
          <View
            style={{
              gap: space.sm,
              marginTop: space.lg,
              padding: space.lg,
              borderRadius: radius.card,
              backgroundColor: theme.bgCard,
              borderWidth: 1,
              borderColor: theme.rule,
            }}
          >
            <Text style={[type.label, { color: theme.ink }]}>You're browsing as a guest</Text>
            <Text style={[type.caption, { color: theme.inkMuted }]}>
              Sign in to save articles, follow topics, and subscribe.
            </Text>
            <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xs }}>
              <View style={{ flex: 1 }}>
                <Button label="Sign in" variant="secondary" onPress={() => navigation.navigate('Auth', { mode: 'login' })} fullWidth />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Create account" onPress={() => navigation.navigate('Auth', { mode: 'signup' })} fullWidth />
              </View>
            </View>
          </View>
        )}

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="Account" />
        </View>
        <MenuRow icon="user" label="Profile" onPress={() => requireAuth(() => navigation.navigate('Profile'))} />
        <MenuRow
          icon="credit-card"
          label="Subscription"
          value={authUser ? (isSubscribed ? 'Premium' : 'Free') : undefined}
          onPress={() =>
            authUser ? navigation.navigate('ManageSubscription') : navigation.navigate('SubscriptionPlans')
          }
        />
        <MenuRow icon="shield" label="Account & security" onPress={() => requireAuth(() => navigation.navigate('AccountSecurity'))} />
        <MenuRow
          icon="bell"
          label="Notifications"
          value={unreadCount ? String(unreadCount) : undefined}
          onPress={() => requireAuth(() => navigation.navigate('Notifications'))}
        />
        <MenuRow
          icon="sliders"
          label="Notification preferences"
          onPress={() => requireAuth(() => navigation.navigate('NotificationPreferences'))}
        />
        <MenuRow icon="tag" label="Your interests" onPress={() => requireAuth(() => navigation.navigate('Interests'))} />
        {/* Referral system deprecated for now — ReferralsScreen/route left in place. */}
        <MenuRow
          icon="message-circle"
          label="Comment replies"
          value={unreadCommentReplies ? String(unreadCommentReplies) : undefined}
          onPress={() => requireAuth(() => navigation.navigate('CommentNotifications'))}
        />
        <MenuRow icon="message-square" label="My comments" onPress={() => requireAuth(() => navigation.navigate('MyComments'))} />

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="Settings & support" />
        </View>
        <AppearanceRow />
        <MenuRow icon="sliders" label="Feed settings" onPress={() => navigation.navigate('FeedSettings')} />
        {/* Language/translation deprecated for now — LanguageScreen/route left in place. */}
        <MenuRow icon="eye" label="Accessibility" onPress={() => navigation.navigate('Accessibility')} />
        <MenuRow icon="wifi" label="Data & offline" onPress={() => navigation.navigate('DataOffline')} />
        <MenuRow icon="help-circle" label="Help Center" onPress={() => navigation.navigate('HelpCenter')} />
        <MenuRow icon="file-text" label="Privacy & Terms" onPress={() => navigation.navigate('PrivacyTerms')} />
        <MenuRow icon="info" label="About" onPress={() => navigation.navigate('About')} />

        <View style={{ marginTop: space.xl }}>
          {authUser ? (
            <MenuRow icon="log-out" label="Sign out" onPress={signOut} />
          ) : (
            <MenuRow icon="log-in" label="Sign in" onPress={() => navigation.navigate('Auth', { mode: 'login' })} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
