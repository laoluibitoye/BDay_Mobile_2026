import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const isSignup = route.params.mode === 'signup';
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [email, setEmail] = useState('');

  const proceed = () => navigation.navigate('PersonaSelection');

  if (showEmailStep) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Text style={[type.articleHeadline, { color: theme.ink }]}>
          {isSignup ? "What's your email?" : 'Enter your email'}
        </Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
          We'll send a secure sign-in link — no password to create or remember.
        </Text>

        <View style={{ marginTop: space.xl }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.inkFaint}
            autoCapitalize="none"
            keyboardType="email-address"
            autoFocus
            style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
          />
          <View style={{ marginTop: space.lg }}>
            <Button label="Send sign-in link" disabled={!email.includes('@')} onPress={proceed} fullWidth />
          </View>
        </View>

        <Text
          style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center', marginTop: space.xxl }]}
          onPress={() => setShowEmailStep(false)}
        >
          Back
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[type.articleHeadline, { color: theme.ink }]}>
        {isSignup ? 'Create your account' : 'Welcome back'}
      </Text>
      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
        {isSignup
          ? 'Already subscribed on our website? We’ll find your account automatically.'
          : 'Log in to pick up where you left off.'}
      </Text>

      <View style={{ marginTop: space.xxl, gap: space.md }}>
        <SocialButton icon="chrome" label="Continue with Google" onPress={proceed} theme={theme} />
        <SocialButton icon="smartphone" label="Continue with Apple" onPress={proceed} theme={theme} />
        <SocialButton icon="mail" label="Continue with Email" onPress={() => setShowEmailStep(true)} theme={theme} />
      </View>

      <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.xl, textAlign: 'center' }]}>
        NO PASSWORDS TO REMEMBER
      </Text>

      {!isSignup && (
        <Text
          style={[type.bodyUI, { color: theme.accentDeep, textAlign: 'center', marginTop: space.lg }]}
          onPress={() => navigation.navigate('AccountRecovery')}
        >
          Trouble signing in?
        </Text>
      )}

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
  input: { borderWidth: 1, borderRadius: radius.button, paddingVertical: space.md, paddingHorizontal: space.lg },
});
