import { apiRequest } from './client';
import type { BookmarkTarget } from './bookmarks';

export type ReadingHistoryRow = {
  id: string;
  postId: string;
  title: string;
  url: string;
  imageUrl: string | null;
  viewedAt: string;
};

export function getReadingHistory(limit?: number): Promise<ReadingHistoryRow[]> {
  return apiRequest(`/api/v1/me/reading-history${limit ? `?limit=${limit}` : ''}`);
}

// Fires once per signed-in article open — mirrors the web SDK's own recordReadingHistoryView()
// exactly: best-effort, never blocks or errors the reading session on a failed/slow write.
// Upserts server-side on (userId, postId), so calling this again on a later re-read is safe.
export function recordReadingHistoryView(target: BookmarkTarget): void {
  void apiRequest('/api/v1/me/reading-history', { method: 'POST', body: JSON.stringify(target) }).catch(
    () => undefined
  );
}
