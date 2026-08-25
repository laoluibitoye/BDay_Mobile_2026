import { useEffect, useState } from 'react';
import { getBookmarks, type BookmarkRow } from '../lib/api/bookmarks';

let cached: BookmarkRow[] | null = null;
let inFlight: Promise<BookmarkRow[]> | null = null;

function fetchBookmarks(): Promise<BookmarkRow[]> {
  if (inFlight) return inFlight;
  inFlight = getBookmarks()
    .then((rows) => {
      cached = rows;
      return rows;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

// Called after a save/unsave so a mounted Saved tab reflects the change — server is the source
// of truth for this list, unlike useRemoteGames' static content.
export function invalidateBookmarksCache(): void {
  cached = null;
}

// Unlike useRemoteGames, this always re-fetches on mount (not just when cache is empty): the
// list changes from user action elsewhere in the app, so a stale cache would hide a save/unsave
// that happened on another screen. `cached` is only used as the flash-free initial value.
export function useBookmarks(): BookmarkRow[] | null {
  const [rows, setRows] = useState<BookmarkRow[] | null>(cached);

  useEffect(() => {
    fetchBookmarks()
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return rows;
}
