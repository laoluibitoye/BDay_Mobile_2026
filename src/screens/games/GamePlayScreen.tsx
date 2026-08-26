import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { QuizQuestion } from '../../data/types';
import { useRemoteGames } from '../../hooks/useRemoteGames';
import { recordResult, STREAK_BADGES } from '../../lib/games/localStats';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GamePlay'>;

export function GamePlayScreen({ route }: Props) {
  const remoteGames = useRemoteGames();
  const remoteGame = remoteGames?.find((g) => g.id === route.params.gameId);
  const title = remoteGame?.title ?? 'Game';

  const questions: QuizQuestion[] = remoteGame
    ? remoteGame.questions.map((q, i) => ({ id: `${remoteGame.id}-${i}`, ...q }))
    : [];

  return (
    <Screen header={<AppHeader variant="compact" title={title} showBack />}>
      {!remoteGame ? (
        <FeedEmptyState title="Game not available" message="This game couldn't be loaded — check your connection." />
      ) : remoteGame.kind === 'quiz' ? (
        <QuizPlay gameId={route.params.gameId} questions={questions} />
      ) : (
        <CrosswordPreview />
      )}
    </Screen>
  );
}

function QuizPlay({ gameId, questions }: { gameId: string; questions: QuizQuestion[] }) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const finished = index >= questions.length;
  const question = questions[index];

  useEffect(() => {
    if (!finished) return;
    const won = score / questions.length >= 0.5;
    recordResult(gameId, won).then(({ newBadges: earned }) => setNewBadges(earned));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const pick = (i: number) => {
    if (pickedIndex !== null) return;
    setPickedIndex(i);
    if (i === question.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    setPickedIndex(null);
    setIndex((i) => i + 1);
  };

  if (finished) {
    return (
      <View style={{ padding: space.lg, alignItems: 'center', paddingTop: space.xxxl }}>
        <Feather name="award" size={40} color={theme.accent} />
        <Text style={[type.displayHeadline, { color: theme.ink, marginTop: space.lg }]}>
          {score}/{questions.length}
        </Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs, textAlign: 'center' }]}>
          Nice work — come back tomorrow to keep your streak alive.
        </Text>
        {newBadges.length > 0 && (
          <View style={{ marginTop: space.lg, alignItems: 'center', gap: space.xs }}>
            <Text style={[type.mono, { color: theme.accentDeep }]}>BADGE UNLOCKED</Text>
            {newBadges.map((id) => {
              const badge = STREAK_BADGES.find((b) => b.id === id);
              return (
                <View
                  key={id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.xs,
                    borderWidth: 1,
                    borderColor: theme.accent,
                    backgroundColor: theme.accentTint,
                    borderRadius: radius.pill,
                    paddingVertical: space.xs,
                    paddingHorizontal: space.md,
                  }}
                >
                  <Feather name="award" size={14} color={theme.accentDeep} />
                  <Text style={[type.label, { color: theme.accentDeep }]}>{badge?.label ?? id}</Text>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ marginTop: space.xl, alignSelf: 'stretch', gap: space.sm }}>
          <Button label="Back to Games" onPress={() => navigation.goBack()} fullWidth />
        </View>
      </View>
    );
  }

  return (
    <View style={{ padding: space.lg }}>
      <Text style={[type.mono, { color: theme.inkFaint }]}>
        QUESTION {index + 1} OF {questions.length}
      </Text>
      <Text style={[type.sectionHeadline, { color: theme.ink, marginTop: space.sm }]}>{question.prompt}</Text>

      <View style={{ marginTop: space.xl, gap: space.md }}>
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex;
          const isPicked = i === pickedIndex;
          const revealed = pickedIndex !== null;
          const borderColor = revealed
            ? isCorrect
              ? theme.marketUp
              : isPicked
                ? theme.accent
                : theme.rule
            : theme.rule;
          const resultLabel = revealed
            ? isCorrect
              ? `${opt}, correct answer`
              : isPicked
                ? `${opt}, your answer, incorrect`
                : opt
            : opt;
          return (
            <Pressable
              key={opt}
              onPress={() => pick(i)}
              disabled={revealed}
              accessibilityRole="button"
              accessibilityLabel={resultLabel}
              style={{
                borderWidth: 1,
                borderColor,
                borderRadius: radius.card,
                padding: space.lg,
                backgroundColor: theme.bgCard,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={[type.bodyUI, { color: theme.ink }]}>{opt}</Text>
              {revealed && isCorrect && <Feather name="check" size={18} color={theme.marketUp} />}
              {revealed && isPicked && !isCorrect && <Feather name="x" size={18} color={theme.accent} />}
            </Pressable>
          );
        })}
      </View>

      {pickedIndex !== null && (
        <View style={{ marginTop: space.xl }}>
          <Button label={index === questions.length - 1 ? 'See results' : 'Next question'} onPress={next} fullWidth />
        </View>
      )}
    </View>
  );
}

function CrosswordPreview() {
  const { theme } = useTheme();
  const grid = Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => (r + c) % 3 !== 0));

  return (
    <View style={{ padding: space.lg, alignItems: 'center' }}>
      <View style={{ gap: 2 }}>
        {grid.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 2 }}>
            {row.map((filled, c) => (
              <View
                key={c}
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: filled ? theme.bgCard : theme.ink,
                  borderWidth: 1,
                  borderColor: theme.rule,
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xl, textAlign: 'center' }]}>
        The full interactive crossword ships in a later phase — see IMPLEMENTATION_PLAN.md's Games roadmap.
      </Text>
    </View>
  );
}
