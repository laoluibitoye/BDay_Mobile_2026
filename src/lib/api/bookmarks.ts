import { apiRequest } from './client';

export type BookmarkTarget = { postId: string; title: string; url: string; imageUrl?: string };

export type BookmarkRow = {
  id: string;
  postId: string;
  title: string;
  url: string;
  imageUrl: string | null;
  createdAt: string;
};

// Deep Dive §10 "save for later" — GET is the Saved tab's real data source; POST/DELETE are the
// per-article Save toggle. POST upserts server-side (bookmarks.service.ts), so re-saving an
// already-saved post is never a duplicate-key error.
export function getBookmarks(): Promise<BookmarkRow[]> {
  return apiRequest('/api/v1/me/bookmarks');
}

export function addBookmark(target: BookmarkTarget): Promise<BookmarkRow> {
  return apiRequest('/api/v1/me/bookmarks', { method: 'POST', body: JSON.stringify(target) });
}

export function removeBookmark(postId: string): Promise<{ removed: boolean }> {
  return apiRequest(`/api/v1/me/bookmarks/${encodeURIComponent(postId)}`, { method: 'DELETE' });
}
