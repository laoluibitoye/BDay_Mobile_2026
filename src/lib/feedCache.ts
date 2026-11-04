import AsyncStorage from '@react-native-async-storage/async-storage';

// Reader-reported: reopening the app (or switching Home tabs right after reopening) showed a
// blank page with a spinner for a few seconds before any content appeared, even though the same
// feed had already loaded before the app was closed. This is the fix — the last successful
// response for a given feed, persisted so it survives app restarts, read back immediately so a
// screen has something to show before its own network refresh (always still kicked off in
// parallel) resolves. Best-effort only: a read/write failure here should never break the feed
// itself, so every call swallows its own errors.
const KEY_PREFIX = 'feed_cache_';

export async function getCachedFeed<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setCachedFeed<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_PREFIX + key, JSON.stringify(data));
  } catch {
    // Best-effort — losing the cache write just means next launch falls back to the spinner.
  }
}
