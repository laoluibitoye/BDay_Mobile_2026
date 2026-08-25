import { wpEntitledGet } from './wpClient';
import type { ArticleEntitlement } from './types';

// AeroPaywall's connector-plugin endpoint — the sole, authoritative, uncached source of truth
// for "can this reader see this article." Verified: this endpoint does zero server-side caching
// by design (every call re-checks live), so this client must not add a cache that could serve
// stale entitlement. The in-flight dedup below only collapses duplicate *concurrent* calls for
// the same article (e.g. a re-render firing the same effect twice) — it never serves a result
// older than the request that's already in flight.
const inFlight = new Map<string, Promise<ArticleEntitlement>>();

export function getArticleEntitlement(postId: number | string, giftToken?: string): Promise<ArticleEntitlement> {
  const key = `${postId}:${giftToken ?? ''}`;
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = wpEntitledGet<ArticleEntitlement>(
    `/wp-json/aeropaywall/v1/articles/${postId}`,
    giftToken
  ).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return promise;
}
