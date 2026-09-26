import React from 'react';
import { Alert, Linking, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { MenuRow } from '../../components/MenuRow';
import { SectionLabel } from '../../components/SectionLabel';
import { useAppState } from '../../state/AppState';
import { space, useTheme } from '../../theme';

const DELETION_REQUEST_EMAIL = 'digital@businessday.ng';

// NDPR-relevant screen. There's no self-service account-deletion endpoint on the backend yet, so
// this can't wipe the server-side record itself — but Apple's account-deletion requirement
// (5.1.1(v)) specifically disallows requiring a reader to leave the app on their own (visit a
// website, dig up a support address) to start that process. A button here that composes the
// request and hands it straight to Mail satisfies "initiated within the app" without needing a
// new backend endpoint — the request itself is still handled by a human, same as any other
// support request, it's just no longer on the reader to go find where to send it.
export function AccountSecurityScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, logout } = useAppState();

  const signOutAllDevices = () => {
    Alert.alert('Sign out of all devices?', 'This will end every active session, including this one.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out everywhere',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        },
      },
    ]);
  };

  const requestAccountDeletion = () => {
    Alert.alert(
      'Request account deletion?',
      "We'll email you to confirm, then permanently delete your account and data. This can take a few days.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request deletion',
          style: 'destructive',
          onPress: () => {
            const subject = encodeURIComponent('Account deletion request');
            const body = encodeURIComponent(
              `Please delete my BusinessDay account and associated data.\n\nAccount email: ${profile.email}`
            );
            Linking.openURL(`mailto:${DELETION_REQUEST_EMAIL}?subject=${subject}&body=${body}`).catch(() =>
              Alert.alert('Unable to open mail app', `Please email ${DELETION_REQUEST_EMAIL} directly to request deletion.`)
            );
          },
        },
      ]
    );
  };

  return (
    <Screen header={<AppHeader variant="compact" title="Account & Security" showBack />}>
      <View style={{ padding: space.lg }}>
        <SectionLabel label="Security" />
        {/* Biometric re-entry — disabled for now, no expo-local-authentication (or equivalent)
            wired up yet to actually enforce it. Re-enable once that's built; see AppState's
            biometricReEntry/setBiometricReEntry, left in place for this to plug back into.
        <View
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
            <Text style={[type.bodyUI, { color: theme.ink }]}>Biometric re-entry</Text>
            <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
              Require Face ID / fingerprint to reopen the app after it's backgrounded.
            </Text>
          </View>
          <Switch
            value={biometricReEntry}
            onValueChange={setBiometricReEntry}
            trackColor={{ true: theme.accent, false: theme.rule }}
            accessibilityLabel="Biometric re-entry"
          />
        </View>
        */}
        <MenuRow icon="mail" label="Change email" value={profile.email} disabled />
        <MenuRow icon="lock" label="Change password" onPress={() => navigation.navigate('ChangePassword')} />
        <MenuRow icon="log-out" label="Sign out of all devices" onPress={signOutAllDevices} />

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="Your data" />
        </View>
        <MenuRow icon="trash-2" label="Request account deletion" onPress={requestAccountDeletion} />
      </View>
    </Screen>
  );
}
