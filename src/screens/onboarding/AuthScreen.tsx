import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { radius, space, type, useTheme } from '../../theme';
import { useAppState } from '../../state/AppState';
import { getMe, login, register } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { registerForPushNotifications } from '../../hooks/usePushNotifications';
import { getAppConfig } from '../../lib/api/appConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { setAuthUser } = useAppState();
  const isSignup = route.params.mode === 'signup';

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = email.includes('@');
  const canSubmit =
    emailValid &&
    password.length >= 8 &&
    (!isSignup || (password === confirmPassword && firstName.trim().length > 0));

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      // register/login only return a token pair (verified — no user payload); the profile comes
      // from a separate GET /me once the tokens are stored. No captchaToken here — the mobile
      // app is exempted server-side (see api/auth.ts's register()) since Cloudflare Turnstile
      // can't complete inside this app's embedded WebView.
      if (isSignup) {
        await register({ email, password, firstName: firstName.trim() });
      } else {
        await login({ email, password });
      }
      const me = await getMe();
      setAuthUser(me);
      void registerForPushNotifications();
      // Editor-requested (2026-09-18): the Interest Picker is hidden while the follow feature is
      // reworked — a signup with it off skips straight to Main, same as a returning login.
      const followEnabled = isSignup && (await getAppConfig().catch(() => null))?.features?.followEnabled;
      if (followEnabled) {
        navigation.navigate('InterestPicker');
      } else {
        // A returning reader logging back in has already picked interests at signup — straight
        // to Main, and reset (not navigate) so Auth/Splash drop off the back stack instead of
        // being one back-swipe away from a signed-in screen.
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }
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
      <Text style={[type.articleHeadline, { color: theme.ink }]}>
        {isSignup ? 'Create your account' : 'Welcome back'}
      </Text>
      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
        {isSignup
          ? 'Already subscribed on our website? Log in with the same email instead.'
          : 'Log in to pick up where you left off.'}
      </Text>

      <View style={{ marginTop: space.xl, gap: space.md }}>
        {isSignup && (
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor={theme.inkFaint}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="givenName"
            style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
          />
        )}
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
          textContentType={isSignup ? 'newPassword' : 'password'}
          style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
        />
        {isSignup && (
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor={theme.inkFaint}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
          />
        )}

        {error && <Text style={[type.bodyUI, { color: theme.marketDown }]}>{error}</Text>}

        <View style={{ marginTop: space.sm }}>
          <Button
            label={isSignup ? 'Create account' : 'Log in'}
            disabled={!canSubmit}
            loading={loading}
            onPress={submit}
            fullWidth
          />
        </View>
      </View>

      {!isSignup && (
        <Text
          style={[type.bodyUI, { color: theme.accentDeep, textAlign: 'center', marginTop: space.lg }]}
          onPress={() => navigation.navigate('AccountRecovery')}
        >
          Trouble signing in?
        </Text>
      )}

      {/* Both platforms: "Continue with Google"/"Continue with Apple" were stub buttons that just
          alerted "not available yet" — that's what triggered Apple's 2.1(a) rejection on iOS.
          Removed everywhere for now rather than ship a broken placeholder on either platform;
          real social login is tracked as separate follow-up work. */}

      <View style={{ marginTop: space.xxxl }}>
        <Button
          label={isSignup ? 'Log in instead' : 'Create an account instead'}
          variant="secondary"
          onPress={() => navigation.setParams({ mode: isSignup ? 'login' : 'signup' })}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, paddingTop: space.huge },
  input: { borderWidth: 1, borderRadius: radius.button, paddingVertical: space.md, paddingHorizontal: space.lg },
});
