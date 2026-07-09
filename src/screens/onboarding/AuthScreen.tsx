import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const isSignup = route.params.mode === 'signup';

  const proceed = () => navigation.navigate('PersonaSelection');

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
        <SocialButton icon="mail" label="Continue with Email" onPress={proceed} theme={theme} />
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
    <View
      style={[styles.socialButton, { borderColor: theme.rule }]}
      onTouchEnd={onPress}
    >
      <Feather name={icon} size={18} color={theme.ink} />
      <Text style={[type.label, { color: theme.ink }]}>{label}</Text>
    </View>
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
  },
});
