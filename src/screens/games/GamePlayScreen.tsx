import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { games, quizQuestions } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GamePlay'>;

export function GamePlayScreen({ route }: Props) {
  const { theme } = useTheme();
  const game = games.find((g) => g.id === route.params.gameId) ?? games[0];

  return (
    <Screen header={<AppHeader variant="compact" title={game.title} showBack />}>
      {game.kind === 'quiz' ? <QuizPlay /> : <CrosswordPreview />}
    </Screen>
  );
}

function QuizPlay() {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const finished = index >= quizQuestions.length;
  const question = quizQuestions[index];

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
          {score}/{quizQuestions.length}
        </Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs, textAlign: 'center' }]}>
          Nice work — come back tomorrow to keep your streak alive.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ padding: space.lg }}>
      <Text style={[type.mono, { color: theme.inkFaint }]}>
        QUESTION {index + 1} OF {quizQuestions.length}
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
          return (
            <Pressable
              key={opt}
              onPress={() => pick(i)}
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
          <Button label={index === quizQuestions.length - 1 ? 'See results' : 'Next question'} onPress={next} fullWidth />
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
