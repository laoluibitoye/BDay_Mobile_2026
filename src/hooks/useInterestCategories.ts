import { useEffect, useState } from 'react';
import { getInterestCategories, type InterestCategory } from '../lib/api/content';

// Module-level cache: the category list is the same for every reader and every screen that
// shows this picker (onboarding, Settings > Interests, Settings > Feed Settings) — no reason to
// re-fetch it three times in one session.
let cache: InterestCategory[] | null = null;
let inflight: Promise<InterestCategory[]> | null = null;

function loadCategories(): Promise<InterestCategory[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = getInterestCategories()
      .then((categories) => {
        cache = categories;
        return categories;
      })
      .catch(() => [])
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useInterestCategories(): { categories: InterestCategory[]; loading: boolean } {
  const [categories, setCategories] = useState<InterestCategory[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    loadCategories().then((result) => {
      if (!cancelled) {
        setCategories(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}
