import { wpPublicGet } from './wpClient';

export type RemoteQuizQuestion = { prompt: string; options: string[]; correctIndex: number };
export type RemoteGame = {
  id: string;
  title: string;
  kind: 'quiz' | 'crossword';
  icon: string;
  questions: RemoteQuizQuestion[];
};

// New games pushed from wp-admin → BusinessDay App → Games. Play results (streaks/wins/badges)
// are never sent back here — that stays entirely local, see src/lib/games/localStats.ts.
export async function getGames(): Promise<RemoteGame[]> {
  const res = await wpPublicGet<{ items: RemoteGame[] }>('/wp-json/businessday-app/v1/games');
  return res.items;
}
