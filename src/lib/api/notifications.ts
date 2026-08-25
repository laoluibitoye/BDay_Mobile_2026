import { apiRequest } from './client';

export type NotificationItem = {
  id: string;
  postId: string;
  title: string;
  url: string;
  imageUrl: string | null;
  createdAt: string;
};

// Merges explicit Notification rows (category-alert fan-out) with recent posts from followed
// topics — no read/unread tracking server-side, purely a feed. Read state stays local
// (AppState's readNotificationIds), same as before this was wired to real data.
export function getNotifications(limit?: number): Promise<NotificationItem[]> {
  return apiRequest(`/api/v1/me/notifications${limit ? `?limit=${limit}` : ''}`);
}
