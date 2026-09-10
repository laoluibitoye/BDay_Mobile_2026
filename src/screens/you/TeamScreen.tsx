import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { ListRow } from '../../components/ListRow';
import { useAppState } from '../../state/AppState';
import { getOrganization, createInvite, listInvites, revokeInvite, changeRole, removeMember } from '../../lib/api/organizations';
import { ApiError } from '../../lib/api/client';
import type { Organization, OrgInviteRow } from '../../lib/api/types';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Team'>;

// Web parity: my-account.ts's Team tab. Only rendered meaningfully once authUser.org is set
// (UpgradeAccountScreen is what sets it) — a signed-in reader with no org gets an upsell instead.
export function TeamScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { authUser } = useAppState();
  const orgId = authUser?.org?.id ?? null;
  const isAdmin = authUser?.org?.role === 'admin';

  const [org, setOrg] = useState<Organization | null>(null);
  const [invites, setInvites] = useState<OrgInviteRow[]>([]);
  const [failed, setFailed] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const load = () => {
    if (!orgId) return;
    setFailed(false);
    Promise.all([getOrganization(orgId), isAdmin ? listInvites(orgId) : Promise.resolve([])])
      .then(([orgRes, invitesRes]) => {
        setOrg(orgRes);
        setInvites(invitesRes);
      })
      .catch(() => setFailed(true));
  };

  useEffect(load, [orgId]);

  const sendInvite = async () => {
    if (!orgId || !inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    try {
      await createInvite(orgId, inviteEmail.trim());
      setInviteEmail('');
      load();
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : 'Could not send invite.');
    } finally {
      setInviting(false);
    }
  };

  const doRevokeInvite = (invite: OrgInviteRow) => {
    if (!orgId) return;
    revokeInvite(orgId, invite.id)
      .then(load)
      .catch(() => Alert.alert('Could not revoke invite', 'Something went wrong. Try again.'));
  };

  const doRemoveMember = (memberId: string) => {
    if (!orgId) return;
    Alert.alert('Remove member?', 'They will lose access to the organization plan.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          removeMember(orgId, memberId)
            .then(load)
            .catch(() => Alert.alert('Could not remove member', 'Something went wrong. Try again.')),
      },
    ]);
  };

  const toggleRole = (memberId: string, currentRole: 'admin' | 'member') => {
    if (!orgId) return;
    changeRole(orgId, memberId, currentRole === 'admin' ? 'member' : 'admin')
      .then(load)
      .catch(() => Alert.alert('Could not change role', 'Something went wrong. Try again.'));
  };

  if (!orgId) {
    return (
      <Screen header={<AppHeader variant="compact" title="Team" showBack />}>
        <View style={{ padding: space.lg }}>
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
            Team management is part of a company account. Set one up to invite colleagues onto your plan.
          </Text>
          <View style={{ marginTop: space.lg }}>
            <Button label="Upgrade Account" onPress={() => navigation.navigate('UpgradeAccount')} fullWidth />
          </View>
        </View>
      </Screen>
    );
  }

  if (failed) {
    return (
      <Screen header={<AppHeader variant="compact" title="Team" showBack />}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="Couldn't load your team" message="Check your connection and try again." onRetry={load} />
        </View>
      </Screen>
    );
  }

  const seatsUsed = org ? org.members.length + invites.length : 0;

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Team" showBack />}>
      <FlatList
        data={org?.members ?? []}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListHeaderComponent={
          org ? (
            <View style={{ marginBottom: space.lg }}>
              <Text style={[type.sectionHeadline, { color: theme.ink }]}>{org.name}</Text>
              <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
                {seatsUsed} of {org.seatsCap} seats used
              </Text>

              {isAdmin && (
                <View style={{ marginTop: space.lg }}>
                  <Text style={[type.label, { color: theme.ink, marginBottom: space.xs }]}>Invite a colleague</Text>
                  <View style={{ flexDirection: 'row', gap: space.sm }}>
                    <TextInput
                      value={inviteEmail}
                      onChangeText={setInviteEmail}
                      placeholder="colleague@company.com"
                      placeholderTextColor={theme.inkFaint}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={[
                        type.bodyUI,
                        { flex: 1, color: theme.ink, borderWidth: 1, borderColor: theme.rule, borderRadius: 8, paddingHorizontal: space.md, paddingVertical: space.sm },
                      ]}
                    />
                    <Button label="Invite" onPress={sendInvite} loading={inviting} disabled={!inviteEmail.trim()} />
                  </View>
                  {inviteError && <Text style={[type.caption, { color: theme.marketDown, marginTop: space.xs }]}>{inviteError}</Text>}

                  {invites.length > 0 && (
                    <View style={{ marginTop: space.lg }}>
                      <Text style={[type.label, { color: theme.ink, marginBottom: space.xs }]}>Pending invites</Text>
                      {invites.map((invite) => (
                        <ListRow
                          key={invite.id}
                          title={invite.email}
                          meta="Pending"
                          rightElement={
                            <Pressable onPress={() => doRevokeInvite(invite)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Revoke invite to ${invite.email}`}>
                              <Feather name="x" size={18} color={theme.inkFaint} />
                            </Pressable>
                          }
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}

              <Text style={[type.label, { color: theme.ink, marginTop: space.lg }]}>Members</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ListRow
            title={item.user.firstName ? `${item.user.firstName}` : item.user.email}
            meta={`${item.user.email} · ${item.role}`}
            rightElement={
              isAdmin && item.userId !== authUser?.id ? (
                <View style={{ flexDirection: 'row', gap: space.lg }}>
                  <Pressable
                    onPress={() => toggleRole(item.id, item.role)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={item.role === 'admin' ? 'Demote to member' : 'Promote to admin'}
                  >
                    <Feather name={item.role === 'admin' ? 'arrow-down' : 'arrow-up'} size={18} color={theme.inkFaint} />
                  </Pressable>
                  <Pressable
                    onPress={() => doRemoveMember(item.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Remove member"
                  >
                    <Feather name="trash-2" size={18} color={theme.inkFaint} />
                  </Pressable>
                </View>
              ) : undefined
            }
          />
        )}
      />
    </Screen>
  );
}
