import React, { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppState } from '../../state/AppState';
import { updateProfile } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { radius, space, type, useTheme } from '../../theme';

// Name and email come straight from the account (authUser) and aren't independently editable
// here — the real PATCH /me only accepts lastName/phone/company (see UpdateProfileRequest).
// Editing them used to silently do nothing: the old version wrote a local-only draft that the
// next session refresh (AppState's authUser-derived profile.name/email sync) quietly reverted,
// with no error and no sign anything had gone wrong.
export function ProfileScreen() {
  const { theme } = useTheme();
  const { authUser, setAuthUser, isSubscribed, profile } = useAppState();
  const [editing, setEditing] = useState(false);
  const [lastName, setLastName] = useState(authUser?.lastName ?? '');
  const [phone, setPhone] = useState(authUser?.phone ?? '');
  const [company, setCompany] = useState(authUser?.company ?? '');
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setLastName(authUser?.lastName ?? '');
    setPhone(authUser?.phone ?? '');
    setCompany(authUser?.company ?? '');
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
      });
      setAuthUser(updated);
      setEditing(false);
    } catch (e) {
      Alert.alert('Could not save', e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      header={
        <AppHeader
          variant="compact"
          title="Profile"
          showBack
          rightAction={
            editing
              ? null
              : { icon: 'edit-3', onPress: startEdit, accessibilityLabel: 'Edit profile' }
          }
        />
      }
    >
      <View style={{ padding: space.lg }}>
        <View
          style={{
            marginTop: space.lg,
            padding: space.lg,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: theme.rule,
            backgroundColor: theme.bgCard,
            gap: space.md,
          }}
        >
          <Field label="Name" value={profile.name} theme={theme} />
          <Field label="Email" value={profile.email} theme={theme} />
          {editing ? (
            <>
              <EditField label="Last name" value={lastName} onChangeText={setLastName} theme={theme} />
              <EditField label="Phone" value={phone} onChangeText={setPhone} theme={theme} keyboardType="phone-pad" />
              <EditField label="Company" value={company} onChangeText={setCompany} theme={theme} />
            </>
          ) : (
            <>
              <Field label="Last name" value={authUser?.lastName || '—'} theme={theme} />
              <Field label="Phone" value={authUser?.phone || '—'} theme={theme} />
              <Field label="Company" value={authUser?.company || '—'} theme={theme} />
            </>
          )}
          <Field label="Plan" value={isSubscribed ? 'Premium Annual' : 'Free'} theme={theme} />
        </View>

        {editing && (
          <View style={{ marginTop: space.lg, flexDirection: 'row', gap: space.md }}>
            <View style={{ flex: 1 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setEditing(false)} fullWidth disabled={saving} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Save" onPress={save} fullWidth loading={saving} />
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

function Field({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View>
      <Text style={[type.mono, { color: theme.inkFaint }]}>{label.toUpperCase()}</Text>
      <Text style={[type.bodyUI, { color: theme.ink, marginTop: 2 }]}>{value}</Text>
    </View>
  );
}

function EditField({
  label,
  value,
  onChangeText,
  theme,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  theme: ReturnType<typeof useTheme>['theme'];
  keyboardType?: 'email-address' | 'phone-pad';
}) {
  return (
    <View>
      <Text style={[type.mono, { color: theme.inkFaint }]}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType ? 'none' : 'words'}
        style={[type.bodyUI, { color: theme.ink, marginTop: 2, paddingVertical: 4, borderBottomWidth: 1, borderColor: theme.rule }]}
      />
    </View>
  );
}
