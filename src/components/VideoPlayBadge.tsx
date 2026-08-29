import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Overlaid on a feed thumbnail when the article's featured media is a video (editorial-meta
// metabox on the theme) — a visual cue only; tapping the card still opens the article as normal,
// where the real player renders (see ArticleReaderScreen's featuredVideoId branch).
export function VideoPlayBadge() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.dim} />
      <View style={styles.center}>
        <View style={styles.circle}>
          <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.18)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
