import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppState } from '../../state/AppState';
import { radius, space, type, useTheme } from '../../theme';

export function ProfileScreen() {
  const { theme } = useTheme();
  const { isSubscribed, profile, setProfile } = useAppState();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const startEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const save = () => {
    setProfile(draft);
    setEditing(false);
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
          {editing ? (
            <>
              <EditField label="Name" value={draft.name} onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))} theme={theme} />
              <EditField
                label="Email"
                value={draft.email}
                onChangeText={(v) => setDraft((d) => ({ ...d, email: v }))}
                theme={theme}
                keyboardType="email-address"
              />
              <EditField label="Role" value={draft.role} onChangeText={(v) => setDraft((d) => ({ ...d, role: v }))} theme={theme} />
            </>
          ) : (
            <>
              <Field label="Name" value={profile.name} theme={theme} />
              <Field label="Email" value={profile.email} theme={theme} />
              <Field label="Role" value={profile.role} theme={theme} />
            </>
          )}
          <Field label="Plan" value={isSubscribed ? 'Premium Annual' : 'Free'} theme={theme} />
        </View>

        {editing && (
          <View style={{ marginTop: space.lg, flexDirection: 'row', gap: space.md }}>
            <View style={{ flex: 1 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setEditing(false)} fullWidth />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Save" onPress={save} fullWidth />
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
  keyboardType?: 'email-address';
}) {
  return (
    <View>
      <Text style={[type.mono, { color: theme.inkFaint }]}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        style={[type.bodyUI, { color: theme.ink, marginTop: 2, paddingVertical: 4, borderBottomWidth: 1, borderColor: theme.rule }]}
      />
    </View>
  );
}
