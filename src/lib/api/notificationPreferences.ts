import { apiRequest } from './client';

export type NotificationPreferences = {
  briefEnabled: boolean;
  commentReplyEmailEnabled: boolean;
  pushEnabled: boolean;
};

export function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiRequest('/api/v1/me/notification-preferences');
}

// Partial patch — send only the field that changed, same as the web SDK's
// notification-preferences.ts. A single combined-body PATCH would risk clobbering whichever
// field the caller didn't touch back to a stale value if two toggles saved concurrently.
export function updateNotificationPreferences(
  patch: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  return apiRequest('/api/v1/me/notification-preferences', { method: 'PATCH', body: JSON.stringify(patch) });
}
