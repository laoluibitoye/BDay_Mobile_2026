import { apiRequest } from './client';
import type { Organization, OrgInviteRow, OrgRole } from './types';

export function getOrganization(orgId: string): Promise<Organization> {
  return apiRequest(`/api/v1/orgs/${orgId}`);
}

export function createInvite(orgId: string, email: string): Promise<OrgInviteRow> {
  return apiRequest(`/api/v1/orgs/${orgId}/invites`, { method: 'POST', body: JSON.stringify({ email }) });
}

export function listInvites(orgId: string): Promise<OrgInviteRow[]> {
  return apiRequest(`/api/v1/orgs/${orgId}/invites`);
}

export function revokeInvite(orgId: string, inviteId: string): Promise<void> {
  return apiRequest(`/api/v1/orgs/${orgId}/invites/${inviteId}`, { method: 'DELETE' });
}

export function changeRole(orgId: string, memberId: string, role: OrgRole): Promise<void> {
  return apiRequest(`/api/v1/orgs/${orgId}/members/${memberId}`, { method: 'PATCH', body: JSON.stringify({ role }) });
}

export function removeMember(orgId: string, memberId: string): Promise<void> {
  return apiRequest(`/api/v1/orgs/${orgId}/members/${memberId}`, { method: 'DELETE' });
}
