import { useEffect, useState } from 'react';
import { getGames, type RemoteGame } from '../lib/api/games';

let cached: RemoteGame[] | null = null;
let inFlight: Promise<RemoteGame[]> | null = null;

function fetchGames(): Promise<RemoteGame[]> {
  if (cached) return Promise.resolve(cached);
  if (inFlight) return inFlight;
  inFlight = getGames()
    .then((games) => {
      cached = games;
      return games;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

// null = still loading / unreachable; consumers fall back to mock games in that case.
export function useRemoteGames(): RemoteGame[] | null {
  const [games, setGames] = useState<RemoteGame[] | null>(cached);

  useEffect(() => {
    if (cached) return;
    fetchGames()
      .then(setGames)
      .catch(() => setGames(null));
  }, []);

  return games;
}
