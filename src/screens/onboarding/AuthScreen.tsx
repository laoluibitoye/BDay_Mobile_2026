import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { radius, space, type, useTheme } from '../../theme';
import { useAppState } from '../../state/AppState';
import { getMe, login } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { registerForPushNotifications } from '../../hooks/usePushNotifications';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

// Sign-in only, both platforms — Apple (3.1.1/3.1.3(a)) and Google Play both flagged in-app
// account registration, since every BusinessDay account is the same type that can later become
// a paying subscriber (there's no separate free-only tier). Accounts are created on
// businessday.ng only; this screen signs an existing account in. The old "Create an account
// instead" toggle is gone too — it was a second way back into registration regardless of how
// a reader got here, which would have undermined every other entry-point fix.
export function AuthScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { setAuthUser } = useAppState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = email.includes('@');
  const canSubmit = emailValid && password.length >= 8;

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      const me = await getMe();
      setAuthUser(me);
      void registerForPushNotifications();
      // Reset (not navigate) so Auth/Splash drop off the back stack instead of being one
      // back-swipe away from a signed-in screen.
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message || 'Something went wrong. Try again.' : 'Could not reach the server. Check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[type.articleHeadline, { color: theme.ink }]}>Welcome back</Text>
      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
        Log in to pick up where you left off.
      </Text>

      <View style={{ marginTop: space.xl, gap: space.md }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={theme.inkFaint}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={theme.inkFaint}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
        />

        {error && <Text style={[type.bodyUI, { color: theme.marketDown }]}>{error}</Text>}

        <View style={{ marginTop: space.sm }}>
          <Button label="Log in" disabled={!canSubmit} loading={loading} onPress={submit} fullWidth />
        </View>
      </View>

      <Text
        style={[type.bodyUI, { color: theme.accentDeep, textAlign: 'center', marginTop: space.lg }]}
        onPress={() => navigation.navigate('AccountRecovery')}
      >
        Trouble signing in?
      </Text>

      <Text style={[type.caption, { color: theme.inkFaint, textAlign: 'center', marginTop: space.xxxl }]}>
        Don't have an account? Create one at businessday.ng
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, paddingTop: space.huge },
  input: { borderWidth: 1, borderRadius: radius.button, paddingVertical: space.md, paddingHorizontal: space.lg },
});
