import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AccountRecovery'>;

// Auth in this app is passwordless (social + email magic link — see AuthScreen), so account
// recovery means "resend the sign-in link," not a traditional password reset flow.
export function AccountRecoveryScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[type.articleHeadline, { color: theme.ink }]}>Trouble signing in?</Text>
      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
        BusinessDay doesn't use passwords. Enter your email and we'll send a secure sign-in link instead.
      </Text>

      {sent ? (
        <View style={[styles.confirm, { borderColor: theme.rule, backgroundColor: theme.bgCard }]}>
          <Feather name="mail" size={22} color={theme.accent} />
          <Text style={[type.label, { color: theme.ink, marginTop: space.sm }]}>Link sent</Text>
          <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2, textAlign: 'center' }]}>
            Check {email || 'your inbox'} for a link to sign back in.
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: space.xl }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.inkFaint}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
          />
          <View style={{ marginTop: space.lg }}>
            <Button label="Send sign-in link" onPress={() => setSent(true)} fullWidth />
          </View>
        </View>
      )}

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
