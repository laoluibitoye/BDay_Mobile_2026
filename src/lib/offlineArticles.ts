import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Article } from '../data/types';

// Reader-reported live: the Downloads tab (ForYouScreen) told readers to "open an article and
// use Download for offline" — but no such control existed anywhere, and even the id list
// (AppState's downloadedArticleIds) had nothing behind it: no article body was ever cached
// anywhere, so a "downloaded" article couldn't actually be read without a network connection.
// This is the real cache: the article's metadata plus its fully-resolved paragraph content
// (fetched once, while online, from the entitlement endpoint — never the locked preview), keyed
// by id in AsyncStorage so it survives app restarts and works with zero connectivity.
export type OfflineArticle = { article: Article; paragraphs: string[] };

const KEY_PREFIX = 'offline_article_';

export async function saveArticleOffline(article: Article, paragraphs: string[]): Promise<void> {
  await AsyncStorage.setItem(KEY_PREFIX + article.id, JSON.stringify({ article, paragraphs }));
}

export async function removeArticleOffline(id: string): Promise<void> {
  await AsyncStorage.removeItem(KEY_PREFIX + id);
}

export async function getOfflineArticle(id: string): Promise<OfflineArticle | null> {
  const raw = await AsyncStorage.getItem(KEY_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OfflineArticle;
  } catch {
    return null;
  }
}
