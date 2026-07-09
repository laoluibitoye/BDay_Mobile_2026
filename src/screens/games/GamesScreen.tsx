import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { games } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

export function GamesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="Games" />
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          A daily puzzle, one tap from anywhere in the app.
        </Text>

        <View style={{ marginTop: space.xl, gap: space.md }}>
          {games.map((game) => (
            <Pressable
              key={game.id}
              onPress={() => navigation.navigate('GamePlay', { gameId: game.id })}
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
                <Feather
                  name={game.kind === 'crossword' ? 'grid' : 'zap'}
                  size={22}
                  color={theme.accentDeep}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: theme.ink }]}>{game.title}</Text>
                <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
                  {game.playedToday ? 'Completed today' : 'Not played yet today'}
                </Text>
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
