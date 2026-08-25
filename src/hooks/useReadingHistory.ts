import { useEffect, useState } from 'react';
import { getReadingHistory, type ReadingHistoryRow } from '../lib/api/readingHistory';

let cached: ReadingHistoryRow[] | null = null;
let inFlight: Promise<ReadingHistoryRow[]> | null = null;

function fetchReadingHistory(): Promise<ReadingHistoryRow[]> {
  if (inFlight) return inFlight;
  inFlight = getReadingHistory()
    .then((rows) => {
      cached = rows;
      return rows;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export function invalidateReadingHistoryCache(): void {
  cached = null;
}

// Always re-fetches on mount, same reasoning as useBookmarks — this list changes from reading
// activity elsewhere in the app.
export function useReadingHistory(): ReadingHistoryRow[] | null {
  const [rows, setRows] = useState<ReadingHistoryRow[] | null>(cached);

  useEffect(() => {
    fetchReadingHistory()
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return rows;
}
