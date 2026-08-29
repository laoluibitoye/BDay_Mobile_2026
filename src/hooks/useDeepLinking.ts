import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { navigationRef } from '../navigation/navigationRef';
import { getArticleById, resolveArticleIdFromUrl } from '../lib/api/content';

// A shared article link is a plain WordPress permalink (businessday.ng/section/article/slug/),
// not our custom `businessday://` scheme — Universal Links (iOS `associatedDomains`, Android
// `intentFilters` once its asset-links fingerprint is available) hand that same https URL to the
// app instead of opening it in a browser. We only ever get the URL, not an article id, so this
// resolves it against the live site (`url_to_postid()`) and fetches that one article before
// navigating, rather than assuming it's already sitting in the in-memory registry.
async function handleUrl(url: string | null): Promise<void> {
  if (!url) return;
  const { hostname, path } = Linking.parse(url);
  if (!hostname || !path || path === '/') return; // our own custom-scheme opens (no host) or a bare domain hit — nothing to route

  const id = await resolveArticleIdFromUrl(url);
  if (!id) return;

  const article = await getArticleById(id);
  if (!article) return;

  await waitForNavigationReady();
  navigationRef.navigate('ArticleReader', { articleId: article.id });
}

// A cold start via Universal Link resolves `getInitialURL()` before `NavigationContainer` has
// mounted (both the network round-trips above and app/font startup take real time, racing each
// other) — navigating before it's ready would silently no-op, which matters most for exactly the
// case this feature exists for: a fresh open straight into a shared article.
function waitForNavigationReady(): Promise<void> {
  if (navigationRef.isReady()) return Promise.resolve();
  return new Promise((resolve) => {
    const check = () => {
      if (navigationRef.isReady()) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

export function useDeepLinking(): void {
  useEffect(() => {
    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', (e) => handleUrl(e.url));
    return () => sub.remove();
  }, []);
}
