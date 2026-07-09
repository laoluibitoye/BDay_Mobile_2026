import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { ArticleCard } from '../../components/ArticleCard';
import { articles } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export function SearchScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return articles.filter((a) => a.headline.toLowerCase().includes(q) || a.section.toLowerCase().includes(q));
  }, [query]);

  return (
    <Screen scroll={false}>
      <View style={{ padding: space.lg }}>
        <View style={[styles.inputRow, { borderColor: theme.rule, backgroundColor: theme.bgCard }]}>
          <Feather name="search" size={18} color={theme.inkMuted} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search articles, reports, topics..."
            placeholderTextColor={theme.inkFaint}
            style={[type.bodyUI, { flex: 1, color: theme.ink }]}
          />
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[type.label, { color: theme.accent }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: space.lg }}
        ListEmptyComponent={
          query ? (
            <Text style={[type.bodyUI, { color: theme.inkMuted }]}>No results for "{query}"</Text>
          ) : (
            <Text style={[type.mono, { color: theme.inkFaint }]}>TRENDING: BANKING · NAIRA · CBN · FINTECH</Text>
          )
        }
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
        )}
      />
    </Screen>
  );
}

const styles = {
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
};
