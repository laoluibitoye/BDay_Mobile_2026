import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { radius, space, type, useTheme } from '../../theme';
import { confirmPasswordReset, requestPasswordReset } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'AccountRecovery'>;

type Stage = 'request' | 'confirm' | 'done';

export function AccountRecoveryScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [stage, setStage] = useState<Stage>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendResetEmail = async () => {
    if (!email.includes('@') || loading) return;
    setLoading(true);
    setError(null);
    try {
      // Always succeeds regardless of whether the email exists — server design, not a bug.
      await requestPasswordReset({ email });
      setStage('confirm');
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const canConfirm = token.trim().length > 0 && newPassword.length >= 8 && newPassword === confirmNewPassword;

  const submitReset = async () => {
    if (!canConfirm || loading) return;
    setLoading(true);
    setError(null);
    try {
      await confirmPasswordReset({ token: token.trim(), newPassword });
      setStage('done');
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message || 'That code is invalid or has expired.'
          : 'Could not reach the server. Check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (stage === 'done') {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.confirm, { borderColor: theme.rule, backgroundColor: theme.bgCard }]}>
          <Feather name="check-circle" size={22} color={theme.accent} />
          <Text style={[type.label, { color: theme.ink, marginTop: space.sm }]}>Password reset</Text>
          <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2, textAlign: 'center' }]}>
            Log back in with your new password.
          </Text>
        </View>
        <View style={{ marginTop: space.xl }}>
          <Button label="Back to sign in" onPress={() => navigation.navigate('Auth', { mode: 'login' })} fullWidth />
        </View>
      </View>
    );
  }

  if (stage === 'confirm') {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Text style={[type.articleHeadline, { color: theme.ink }]}>Check your email</Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
          We sent a reset code to {email || 'your inbox'}. Enter it below with a new password. The code expires in
          an hour.
        </Text>

        <View style={{ marginTop: space.xl, gap: space.md }}>
          <TextInput
            value={token}
            onChangeText={setToken}
            placeholder="Reset code"
            placeholderTextColor={theme.inkFaint}
            autoCapitalize="none"
            autoCorrect={false}
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
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
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
            <Button label="Reset password" disabled={!canConfirm} loading={loading} onPress={submitReset} fullWidth />
          </View>
        </View>

        <Text
          style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center', marginTop: space.xxl }]}
          onPress={() => setStage('request')}
        >
          Use a different email
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[type.articleHeadline, { color: theme.ink }]}>Trouble signing in?</Text>
      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
        Enter your email and we'll send you a code to reset your password.
      </Text>

      <View style={{ marginTop: space.xl }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={theme.inkFaint}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
        />
        {error && <Text style={[type.bodyUI, { color: theme.marketDown, marginTop: space.sm }]}>{error}</Text>}
        <View style={{ marginTop: space.lg }}>
          <Button
            label="Send reset code"
            disabled={!email.includes('@')}
            loading={loading}
            onPress={sendResetEmail}
            fullWidth
          />
        </View>
      </View>

      <Text
        style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center', marginTop: space.xxl }]}
        onPress={() => navigation.goBack()}
      >
        Back to sign in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, paddingTop: space.huge },
  input: { borderWidth: 1, borderRadius: radius.button, paddingVertical: space.md, paddingHorizontal: space.lg },
  confirm: {
    marginTop: space.xl,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: space.xl,
    alignItems: 'center',
  },
});
