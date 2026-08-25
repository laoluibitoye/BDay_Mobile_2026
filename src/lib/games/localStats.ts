import AsyncStorage from '@react-native-async-storage/async-storage';

// Game results are intentionally never sent to any backend — streaks/wins/losses/badges are
// pure local engagement state, stored per-device. The goal is encouraging more time in the app,
// not a synced leaderboard; see IMPLEMENTATION_PLAN.md §18.
const STORAGE_PREFIX = 'bd_game_stats_';

export type GameStats = {
  streak: number;
  bestStreak: number;
  wins: number;
  losses: number;
  totalPlays: number;
  lastPlayedDate: string | null; // YYYY-MM-DD, device-local
  badges: string[];
};

const EMPTY_STATS: GameStats = {
  streak: 0,
  bestStreak: 0,
  wins: 0,
  losses: 0,
  totalPlays: 0,
  lastPlayedDate: null,
  badges: [],
};

export const STREAK_BADGES: { id: string; threshold: number; label: string }[] = [
  { id: 'streak-3', threshold: 3, label: '3-Day Streak' },
  { id: 'streak-7', threshold: 7, label: 'Week Streak' },
  { id: 'streak-14', threshold: 14, label: 'Fortnight Streak' },
  { id: 'streak-30', threshold: 30, label: 'Month Streak' },
];

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export async function getStats(gameId: string): Promise<GameStats> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_PREFIX + gameId);
    return raw ? { ...EMPTY_STATS, ...JSON.parse(raw) } : EMPTY_STATS;
  } catch {
    return EMPTY_STATS;
  }
}

export async function hasPlayedToday(gameId: string): Promise<boolean> {
  const stats = await getStats(gameId);
  return stats.lastPlayedDate === todayLocal();
}

// Call once per completed play session. Returns the updated stats plus any badges newly earned
// by this specific play (so the UI can show a one-time "Badge unlocked" moment).
export async function recordResult(gameId: string, won: boolean): Promise<{ stats: GameStats; newBadges: string[] }> {
  const prev = await getStats(gameId);
  const today = todayLocal();

  let streak = prev.streak;
  if (prev.lastPlayedDate === today) {
    // already played today — result still counts toward wins/losses, streak unaffected
  } else if (prev.lastPlayedDate && daysBetween(prev.lastPlayedDate, today) === 1) {
    streak = prev.streak + 1;
  } else {
    streak = 1;
  }

  const nextStats: GameStats = {
    streak,
    bestStreak: Math.max(prev.bestStreak, streak),
    wins: prev.wins + (won ? 1 : 0),
    losses: prev.losses + (won ? 0 : 1),
    totalPlays: prev.totalPlays + 1,
    lastPlayedDate: today,
    badges: prev.badges,
  };

  const newBadges = STREAK_BADGES.filter((b) => streak >= b.threshold && !prev.badges.includes(b.id)).map((b) => b.id);
  nextStats.badges = [...prev.badges, ...newBadges];

  await AsyncStorage.setItem(STORAGE_PREFIX + gameId, JSON.stringify(nextStats));
  return { stats: nextStats, newBadges };
}
