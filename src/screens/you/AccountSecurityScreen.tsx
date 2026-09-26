import React from 'react';
import { Alert, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { MenuRow } from '../../components/MenuRow';
import { SectionLabel } from '../../components/SectionLabel';
import { useAppState } from '../../state/AppState';
import { space, useTheme } from '../../theme';

// NDPR-relevant screen. Account deletion is handled by contacting support (see
// PrivacyTermsScreen's "Your rights under NDPR" section) rather than an in-app self-service
// action — there's no real account-deletion endpoint on the backend yet, and a button that only
// wiped local device state without touching the server record would misrepresent what it does.
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
      </View>
    </Screen>
  );
}
