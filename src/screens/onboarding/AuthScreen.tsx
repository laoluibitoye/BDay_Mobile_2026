import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { CaptchaWidget } from '../../components/CaptchaWidget';
import { radius, space, type, useTheme } from '../../theme';
import { useAppState } from '../../state/AppState';
import { getMe, login, register } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { getCaptchaConfig, type CaptchaConfig } from '../../lib/api/publicConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { setAuthUser } = useAppState();
  const isSignup = route.params.mode === 'signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Distinct from "captcha off" (server has no secret key configured, e.g. local dev — 'off') so
  // a transient network failure while fetching this config ('error') fails CLOSED rather than
  // silently behaving as if captcha were off. An earlier version of this collapsed "off" and
  // "fetch failed" into the same null state, which meant one flaky request let signup through
  // with no token at all — reproducing the exact "Captcha verification failed" bug this screen
  // exists to fix.
  const [captchaStatus, setCaptchaStatus] = useState<'loading' | 'off' | 'ready' | 'error'>('loading');
  const [captchaConfig, setCaptchaConfig] = useState<CaptchaConfig | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRetryTick, setCaptchaRetryTick] = useState(0);

  useEffect(() => {
    if (!isSignup) return;
    let cancelled = false;
    setCaptchaStatus('loading');
    getCaptchaConfig()
      .then((config) => {
        if (cancelled) return;
        if (config) {
          setCaptchaConfig(config);
          setCaptchaStatus('ready');
        } else {
          setCaptchaStatus('off');
        }
      })
      .catch(() => {
        if (!cancelled) setCaptchaStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [isSignup, captchaRetryTick]);

  const emailValid = email.includes('@');
  const captchaSatisfied =
    captchaStatus === 'off' || (captchaStatus === 'ready' && Boolean(captchaToken));
  const canSubmit =
    emailValid &&
    password.length >= 8 &&
    (!isSignup || password === confirmPassword) &&
    (!isSignup || captchaSatisfied);

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      // register/login only return a token pair (verified — no user payload); the profile comes
      // from a separate GET /me once the tokens are stored.
      if (isSignup) {
        await register({ email, password, captchaToken: captchaToken ?? undefined });
      } else {
        await login({ email, password });
      }
      const me = await getMe();
      setAuthUser(me);
      navigation.navigate('PersonaSelection');
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

        {isSignup && captchaStatus === 'loading' && (
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>Checking verification requirements…</Text>
        )}
        {isSignup && captchaStatus === 'error' && (
          <View style={{ gap: space.xs }}>
            <Text style={[type.bodyUI, { color: theme.marketDown }]}>
              Couldn't reach the verification service. Check your connection.
            </Text>
            <Text
              style={[type.bodyUI, { color: theme.accentDeep }]}
              onPress={() => setCaptchaRetryTick((t) => t + 1)}
            >
              Try again
            </Text>
          </View>
        )}
        {isSignup && captchaStatus === 'ready' && captchaConfig && (
          <CaptchaWidget
            provider={captchaConfig.provider}
            siteKey={captchaConfig.siteKey}
            onToken={setCaptchaToken}
            onExpire={() => setCaptchaToken(null)}
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
