import { useEffect } from 'react';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { navigationRef } from '../navigation/navigationRef';
import { registerPushTokenWithServer, unregisterPushTokenWithServer } from '../lib/api/pushTokens';

const LAST_TOKEN_KEY = 'bd_push_token';

// expo-notifications' own module graph calls `requireNativeModule('ExpoPushTokenManager')` at
// import time (not inside any function) — so a plain `import * as Notifications from
// 'expo-notifications'` at the top of this file throws immediately on any install that hasn't
// been through `expo prebuild` + a native rebuild since the package was added, before a single
// line of this file's own code runs. A `try {...} catch` around that code can't help; the crash
// happens during module evaluation, earlier than any try/catch here would run. Loading it lazily
// with `require(...)` inside a try/catch, only when actually needed, is the only way to keep an
// un-rebuilt install from crashing on launch.
type NotificationsModule = typeof import('expo-notifications');

function loadNotifications(): NotificationsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- must stay a lazy require, see comment above
    return require('expo-notifications') as NotificationsModule;
  } catch {
    return null;
  }
}

// `Notifications` being a real module object (loadNotifications() didn't return null) only means
// the JS package resolved — expo-modules-core's native bindings are resolved lazily per-call, so
// this first actual call is where an un-rebuilt install's missing native module throws. Guarded
// here, once, rather than relying on every caller to wrap its own call to this function.
let handlerInstalled = false;
function ensureHandlerInstalled(Notifications: NotificationsModule) {
  if (handlerInstalled) return;
  handlerInstalled = true;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // native module not built into this install yet — notifications just stay unavailable
  }
}

// Registers this device for push and wires a tap on a delivered notification straight to the
// relevant article — mirrors NotificationsScreen.tsx's own `articleId: item.postId` mapping so a
// push and an in-app notification row behave identically. Called once from App.tsx on mount (for
// the tap-listener) and again after login (to associate a fresh token with the now-known user).
// No-op on an install where the native module isn't built yet (see comment above).
export function usePushNotifications() {
  useEffect(() => {
    const Notifications = loadNotifications();
    if (!Notifications) return undefined;

    ensureHandlerInstalled(Notifications);

    try {
      const sub = Notifications.addNotificationResponseReceivedListener((response) => {
        const postId = response.notification.request.content.data?.postId;
        if (typeof postId === 'string' && navigationRef.isReady()) {
          navigationRef.navigate('ArticleReader', { articleId: postId });
        }
      });
      return () => sub.remove();
    } catch {
      return undefined;
    }
  }, []);
}

// Call after a successful login/register — a token requested while logged out has no user to
// attach to server-side. No-op (not an error) when EAS project id isn't configured yet, when the
// native module isn't built into this install yet, on a simulator, or if the reader declines the
// permission prompt.
export async function registerForPushNotifications(): Promise<void> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return;

  const Notifications = loadNotifications();
  if (!Notifications) return;

  try {
    ensureHandlerInstalled(Notifications);

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

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await registerPushTokenWithServer(token, Platform.OS === 'ios' ? 'ios' : 'android');
    await SecureStore.setItemAsync(LAST_TOKEN_KEY, token);
  } catch {
    // native module not built yet, or the platform/user declined — push just stays unavailable
  }
}

// Call on logout — drops server-side association so a signed-out device stops receiving another
// user's follows-based pushes.
export async function unregisterPushNotifications(): Promise<void> {
  const token = await SecureStore.getItemAsync(LAST_TOKEN_KEY);
  if (!token) return;
  await unregisterPushTokenWithServer(token).catch(() => undefined);
  await SecureStore.deleteItemAsync(LAST_TOKEN_KEY);
}
