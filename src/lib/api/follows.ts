import { apiRequest } from './client';

export type Taxonomy = 'category' | 'tag';

export type FollowRow = {
  id: string;
  taxonomy: Taxonomy;
  termId: string;
  termLabel: string;
  notifyImmediately: boolean;
  createdAt: string;
};

export type CreateFollowInput = { taxonomy: Taxonomy; termId: string; termLabel: string; notifyImmediately?: boolean };

// Unlike bookmarks, follows *does* pre-check on web (sdk's interest-picker.ts fetches on mount)
// — this app mirrors that: AppState seeds `followedTopics` from this on session refresh.
export function getFollows(): Promise<FollowRow[]> {
  return apiRequest('/api/v1/me/follows');
}

export function follow(input: CreateFollowInput): Promise<FollowRow> {
  return apiRequest('/api/v1/me/follows', { method: 'POST', body: JSON.stringify(input) });
}

export function unfollow(taxonomy: Taxonomy, termId: string): Promise<{ removed: boolean }> {
  return apiRequest(`/api/v1/me/follows/${taxonomy}/${encodeURIComponent(termId)}`, { method: 'DELETE' });
}

export function setFollowAlert(taxonomy: Taxonomy, termId: string, notifyImmediately: boolean): Promise<FollowRow> {
  return apiRequest(`/api/v1/me/follows/${taxonomy}/${encodeURIComponent(termId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ notifyImmediately }),
  });
}
