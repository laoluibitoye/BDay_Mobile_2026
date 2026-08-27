import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { radius, space, type, useTheme } from '../../theme';
import { useAppState } from '../../state/AppState';
import { getMe, login, register } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { registerForPushNotifications } from '../../hooks/usePushNotifications';

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
      if (isSignup) {
        navigation.navigate('InterestPicker');
      } else {
        // A returning reader logging back in has already been through onboarding/interests —
        // straight to Main, and reset (not navigate) so Auth/Onboarding/Splash drop off the
        // back stack instead of being one back-swipe away from a signed-in screen.
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

  const socialComingSoon = (provider: string) =>
    Alert.alert(`Continue with ${provider}`, "This sign-in method isn't available in this preview build yet.");

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

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.rule }]} />
        <Text style={[type.caption, { color: theme.inkFaint, marginHorizontal: space.sm }]}>OR</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.rule }]} />
      </View>

      <View style={{ gap: space.md }}>
        <SocialButton icon="chrome" label="Continue with Google" onPress={() => socialComingSoon('Google')} theme={theme} />
        <SocialButton icon="smartphone" label="Continue with Apple" onPress={() => socialComingSoon('Apple')} theme={theme} />
      </View>

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

function SocialButton({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.socialButton,
        { borderColor: theme.rule },
        pressed && { backgroundColor: theme.bgCard },
      ]}
    >
      <Feather name={icon} size={18} color={theme.ink} />
      <Text style={[type.label, { color: theme.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, paddingTop: space.huge },
  input: { borderWidth: 1, borderRadius: radius.button, paddingVertical: space.md, paddingHorizontal: space.lg },
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: space.xl, marginBottom: space.lg },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    minHeight: 44,
  },
});
