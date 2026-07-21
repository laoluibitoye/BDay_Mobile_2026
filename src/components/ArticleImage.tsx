import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Article } from '../data/types';

type Props = {
  article: Article;
  style: ViewStyle;
};

// Shared image surface for every article card/hero/thumb — backs nearly every scrolling feed in
// the app, so this is the single highest-leverage place for image performance: `expo-image`
// (not RN's core `Image`) decodes off the UI thread and caches to memory+disk, which matters a
// lot more on Android than iOS since RN's core Image has historically been the weaker/jankier
// half of that pair there. `recyclingKey` tells it which photo a recycled FlatList row now holds,
// so scrolling doesn't flash the previous row's image for a frame before the new one decodes.
export function ArticleImage({ article, style }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  if (!article.imageUrl || status === 'error') {
    return <View style={[styles.fill, { backgroundColor: article.heroColor }, style]} />;
  }

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={{ uri: article.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        recyclingKey={article.id}
        cachePolicy="memory-disk"
        transition={150}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
      {status === 'loading' && <View style={[StyleSheet.absoluteFill, { backgroundColor: article.heroColor }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {},
  wrap: { overflow: 'hidden' },
});
