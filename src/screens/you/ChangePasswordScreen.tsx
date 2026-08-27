import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { radius, space, type, useTheme } from '../../theme';
import { changePassword } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

// Web equivalent: my-account.ts's renderPasswordTab. Distinct from AccountRecoveryScreen, which
// is the logged-out "forgot password" flow — this is a logged-in reader changing a password they
// already know, via PATCH /me/password (currentPassword required server-side).
export function ChangePasswordScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword && !loading;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await changePassword({ currentPassword, newPassword });
      setDone(true);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message || 'Could not change your password.' : 'Could not reach the server. Check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Screen header={<AppHeader variant="compact" title="Change password" showBack />}>
        <View style={[styles.confirm, { borderColor: theme.rule, backgroundColor: theme.bgCard }]}>
          <Feather name="check-circle" size={22} color={theme.accent} />
          <Text style={[type.label, { color: theme.ink, marginTop: space.sm }]}>Password changed</Text>
          <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2, textAlign: 'center' }]}>
            Use your new password next time you sign in.
          </Text>
        </View>
        <View style={{ marginTop: space.xl }}>
          <Button label="Done" onPress={() => navigation.goBack()} fullWidth />
        </View>
      </Screen>
    );
  }

  return (
    <Screen header={<AppHeader variant="compact" title="Change password" showBack />}>
      <View style={{ padding: space.lg }}>
        <View style={{ gap: space.md }}>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            placeholderTextColor={theme.inkFaint}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor={theme.inkFaint}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={theme.inkFaint}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
          />
          {error && <Text style={[type.bodyUI, { color: theme.marketDown }]}>{error}</Text>}
          <View style={{ marginTop: space.sm }}>
            <Button label="Change password" disabled={!canSubmit} loading={loading} onPress={submit} fullWidth />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: radius.button, paddingVertical: space.md, paddingHorizontal: space.lg },
  confirm: {
    margin: space.lg,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: space.xl,
    alignItems: 'center',
  },
});
