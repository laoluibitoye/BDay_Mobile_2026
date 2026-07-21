import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Article } from '../data/types';
import { layout, space } from '../theme';
import { HeroArticleCard } from './HeroArticleCard';

const NEON_RED = '#FF1A1A';

type Props = {
  articles: Article[];
  onPressArticle: (id: string) => void;
};

// design.md §6 "Hero article card" — the lead story is now a swipeable 5-slide carousel (one
// slide visible at a time) instead of a single static card, with dot pagination below.
export function HeroCarousel({ articles, onPressArticle }: Props) {
  const { width } = useWindowDimensions();
  const slideWidth = width - space.lg * 2;
  const [index, setIndex] = useState(0);

  return (
    <View style={styles.wrap}>
      <FlatList
        data={articles}
        keyExtractor={(a) => a.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
          setIndex(Math.max(0, Math.min(i, articles.length - 1)));
        }}
        renderItem={({ item }) => (
          <View style={{ width: slideWidth }}>
            <HeroArticleCard article={item} onPress={() => onPressArticle(item.id)} />
          </View>
        )}
      />
      {articles.length > 1 && (
        <View style={styles.dots}>
          {articles.map((a, i) => (
            <Dot key={a.id} active={i === index} />
          ))}
        </View>
      )}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, glow]);

  if (!active) {
    return <View style={styles.dotInactive} />;
  }

  return (
    <Animated.View
      style={[
        styles.dotActive,
        {
          opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
          transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: layout.sectionGap - space.md },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  dotInactive: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00000024' },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NEON_RED,
    shadowColor: NEON_RED,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
