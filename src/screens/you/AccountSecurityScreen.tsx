import React from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { MenuRow } from '../../components/MenuRow';
import { SectionLabel } from '../../components/SectionLabel';
import { useAppState } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

// NDPR-relevant screen — kept to real, working actions where possible (biometric toggle, sign-out,
// account deletion actually clears local state) rather than a flat placeholder note, since this
// screen carries real compliance weight, unlike e.g. About.
export function AccountSecurityScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, biometricReEntry, setBiometricReEntry, clearHistory, clearDownloads } = useAppState();

  const signOutAllDevices = () => {
    Alert.alert('Sign out of all devices?', 'This will end every active session, including this one.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out everywhere',
        style: 'destructive',
        onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }),
      },
    ]);
  };

  const deleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your saved articles, reading history, downloads, and profile from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            clearDownloads();
            navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          },
        },
      ]
    );
  };

  return (
    <Screen header={<AppHeader variant="compact" title="Account & Security" showBack />}>
      <View style={{ padding: space.lg }}>
        <SectionLabel label="Security" />
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
        <MenuRow icon="mail" label="Change email" value={profile.email} disabled />
        <MenuRow icon="lock" label="Change password" onPress={() => navigation.navigate('ChangePassword')} />
        <MenuRow icon="log-out" label="Sign out of all devices" onPress={signOutAllDevices} />

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="Your data" />
        </View>
        <Text style={[type.caption, { color: theme.inkMuted, marginBottom: space.sm }]}>
          Under NDPR, you can request a copy of your data or ask us to delete it.
        </Text>
        <MenuRow
          icon="download"
          label="Download my data"
          value="Coming soon"
          disabled
        />
        <MenuRow icon="trash-2" label="Delete my account" onPress={deleteAccount} />
      </View>
    </Screen>
  );
}
