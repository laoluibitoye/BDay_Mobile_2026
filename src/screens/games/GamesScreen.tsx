import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { useRemoteGames } from '../../hooks/useRemoteGames';
import { getStats, STREAK_BADGES } from '../../lib/games/localStats';
import { radius, space, type, useTheme } from '../../theme';

type DisplayGame = {
  id: string;
  title: string;
  kind: 'crossword' | 'quiz';
  icon: React.ComponentProps<typeof Feather>['name'];
  streak: number;
  playedToday: boolean;
  badges: string[];
};

export function GamesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const remoteGames = useRemoteGames();
  const [displayGames, setDisplayGames] = useState<DisplayGame[]>([]);

  useEffect(() => {
    if (!remoteGames || remoteGames.length === 0) {
      setDisplayGames([]);
      return;
    }
    const source = remoteGames.map((g) => ({ id: g.id, title: g.title, kind: g.kind, icon: (g.icon || 'zap') as DisplayGame['icon'] }));

    let cancelled = false;
    Promise.all(
      source.map(async (g) => {
        const stats = await getStats(g.id);
        return {
          ...g,
          streak: stats.streak,
          playedToday: stats.lastPlayedDate === new Date().toISOString().slice(0, 10),
          badges: stats.badges,
        };
      })
    ).then((merged) => {
      if (!cancelled) setDisplayGames(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [remoteGames]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="Games" />
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          A daily puzzle, one tap from anywhere in the app.
        </Text>

        {remoteGames !== null && remoteGames.length === 0 && (
          <View style={{ marginTop: space.xl }}>
            <FeedEmptyState title="No games yet" message="Check back soon for daily puzzles and quizzes." />
          </View>
        )}

        <View style={{ marginTop: space.xl, gap: space.md }}>
          {displayGames.map((game) => (
            <Pressable
              key={game.id}
              onPress={() => {
                if (game.playedToday) {
                  Alert.alert('Play again?', "You've already completed this today. Replay for practice?", [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Replay', onPress: () => navigation.navigate('GamePlay', { gameId: game.id }) },
                  ]);
                } else {
                  navigation.navigate('GamePlay', { gameId: game.id });
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`${game.title}, ${game.playedToday ? 'completed today' : 'not played yet today'}, ${game.streak} day streak`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                padding: space.lg,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: theme.rule,
                backgroundColor: theme.bgCard,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: radius.card,
                  backgroundColor: theme.accentTint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name={game.kind === 'crossword' ? 'hash' : game.icon} size={22} color={theme.accentDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: theme.ink }]}>{game.title}</Text>
                <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
                  {game.playedToday ? 'Completed today' : 'Not played yet today'}
                </Text>
                {game.badges.length > 0 && (
                  <View style={{ flexDirection: 'row', gap: 4, marginTop: space.xs }}>
                    {game.badges.map((badgeId) => {
                      const badge = STREAK_BADGES.find((b) => b.id === badgeId);
                      return (
                        <View
                          key={badgeId}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 2,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: radius.pill,
                            backgroundColor: theme.accentTint,
                          }}
                        >
                          <Feather name="award" size={10} color={theme.accentDeep} />
                          <Text style={[type.caption, { color: theme.accentDeep, fontSize: 10 }]}>{badge?.label ?? badgeId}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[type.mono, { color: theme.accent }]}>{game.streak}🔥</Text>
                <Text style={[type.caption, { color: theme.inkFaint }]}>streak</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
