import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { SectionTabStrip } from '../../components/SectionTabStrip';
import { ArticleCard } from '../../components/ArticleCard';
import { articles, sections } from '../../data/mock';
import { space, type, useTheme } from '../../theme';

export function ExploreScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [active, setActive] = useState<string>(sections[0]);

  const filtered = active === 'Top Stories' ? articles : articles.filter((a) => a.section === active);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader
        variant="compact"
        title="Explore"
        rightAction={{ icon: 'search', onPress: () => navigation.navigate('Search'), accessibilityLabel: 'Search' }}
      />
      <View style={{ marginTop: space.md, borderBottomWidth: 1, borderColor: theme.rule, paddingBottom: space.sm }}>
        <SectionTabStrip items={sections} active={active} onSelect={setActive} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xl }]}>
            No stories in this section yet.
          </Text>
        }
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => navigation.navigate('ArticleReader', { articleId: item.id })} />
        )}
      />
    </SafeAreaView>
  );
}
