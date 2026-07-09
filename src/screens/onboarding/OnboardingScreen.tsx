import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const SLIDES = [
  {
    eyebrow: 'PERSONALIZED',
    title: 'A front page built around what you follow',
    body: 'Pick a few topics and your feed reshapes itself immediately — banking, markets, energy, and more.',
  },
  {
    eyebrow: 'INTELLIGENCE',
    title: 'Beyond headlines, toward decisions',
    body: 'Premium reports, market data, and analysis that help you act — not just read.',
  },
  {
    eyebrow: 'TRUSTED',
    title: 'Africa’s business daily, on your phone',
    body: 'Credible journalism, live market prices, and a daily briefing worth ten minutes.',
  },
];

const { width } = Dimensions.get('window');

export function OnboardingScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      navigation.navigate('Auth', { mode: 'signup' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={[type.mono, { color: theme.accent }]}>{item.eyebrow}</Text>
            <Text style={[type.displayHeadline, { color: theme.ink, marginTop: space.md }]}>{item.title}</Text>
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.lg }]}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={s.title}
            style={[styles.dot, { backgroundColor: i === index ? theme.accent : theme.rule }]}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <Button label={index === SLIDES.length - 1 ? 'Get started' : 'Next'} onPress={next} fullWidth />
        <Text
          style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center', marginTop: space.lg }]}
          onPress={() => navigation.navigate('Auth', { mode: 'login' })}
        >
          Already have an account? Log in
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: space.huge },
  slide: { paddingHorizontal: space.xl, justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, marginVertical: space.xl },
  dot: { width: 6, height: 6, borderRadius: 3 },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.xxl },
});
