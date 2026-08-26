import { apiRequest } from './client';

export function registerPushTokenWithServer(token: string, platform: 'ios' | 'android'): Promise<{ registered: true }> {
  return apiRequest('/api/v1/me/push-tokens', {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
  });
}

export function unregisterPushTokenWithServer(token: string): Promise<{ unregistered: true }> {
  return apiRequest(`/api/v1/me/push-tokens/${encodeURIComponent(token)}`, { method: 'DELETE' });
}
