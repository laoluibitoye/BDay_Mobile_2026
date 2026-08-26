import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { navigationRef } from '../navigation/navigationRef';
import { registerPushTokenWithServer, unregisterPushTokenWithServer } from '../lib/api/pushTokens';

const LAST_TOKEN_KEY = 'bd_push_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Registers this device for push and wires a tap on a delivered notification straight to the
// relevant article — mirrors NotificationsScreen.tsx's own `articleId: item.postId` mapping so a
// push and an in-app notification row behave identically. Called once from App.tsx on mount (for
// the tap-listener) and again after login (to associate a fresh token with the now-known user).
export function usePushNotifications() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const postId = response.notification.request.content.data?.postId;
      if (typeof postId === 'string' && navigationRef.isReady()) {
        navigationRef.navigate('ArticleReader', { articleId: postId });
      }
    });
    return () => sub.remove();
  }, []);
}

// Call after a successful login/register — a token requested while logged out has no user to
// attach to server-side. No-op (not an error) when EAS project id isn't configured yet, or on a
// simulator, or if the reader declines the permission prompt.
export async function registerForPushNotifications(): Promise<void> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') return;

  let token: string;
  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch {
    return;
  }

  await registerPushTokenWithServer(token, Platform.OS === 'ios' ? 'ios' : 'android');
  await SecureStore.setItemAsync(LAST_TOKEN_KEY, token);
}

// Call on logout — drops server-side association so a signed-out device stops receiving another
// user's follows-based pushes.
export async function unregisterPushNotifications(): Promise<void> {
  const token = await SecureStore.getItemAsync(LAST_TOKEN_KEY);
  if (!token) return;
  await unregisterPushTokenWithServer(token).catch(() => undefined);
  await SecureStore.deleteItemAsync(LAST_TOKEN_KEY);
}
