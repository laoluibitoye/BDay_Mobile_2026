import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Article } from '../data/types';
import { useAppState } from '../state/AppState';
import { elevation, layout, radius, space, type, useTheme } from '../theme';
import { ArticleImage } from './ArticleImage';
import { LiveBadge, PremiumBadge } from './Badge';

type Props = {
  article: Article;
  onPress: () => void;
};

// design.md §6 "Hero article card" — the single raised card on Today; everything else stays flat.
// Shadow lives on an outer wrapper (no overflow:hidden) so iOS doesn't clip it; the inner
// View owns the rounded corners + overflow:hidden for the hero image.
export function HeroArticleCard({ article, onPress }: Props) {
  const { theme } = useTheme();
  const { savedArticleIds, toggleSaved } = useAppState();
  const isSaved = savedArticleIds.includes(article.id);

  return (
    <Pressable onPress={onPress} style={[styles.shadowWrap, elevation.raised]}>
      <View style={[styles.card, { backgroundColor: theme.bgCard }]}>
        <ArticleImage article={article} style={styles.hero} />
        <View style={styles.body}>
          {article.isLive ? <LiveBadge /> : article.isPremium ? <PremiumBadge /> : null}
          <Text style={[type.displayHeadline, { color: theme.ink, marginTop: space.sm }]} numberOfLines={4}>
            {article.headline}
          </Text>
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]} numberOfLines={2}>
            {article.dek}
          </Text>
          <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.md }]}>
            {article.authorName.toUpperCase()} · {article.publishedAt} · {article.readTime}
          </Text>
          <View style={styles.toolbar}>
            <Pressable hitSlop={(layout.touchTarget - 20) / 2} accessibilityLabel="Listen to this article">
              <Feather name="headphones" size={20} color={theme.inkMuted} />
            </Pressable>
            <Pressable hitSlop={(layout.touchTarget - 20) / 2} style={styles.toolbarItem} accessibilityLabel="Comments">
              <Feather name="message-circle" size={20} color={theme.inkMuted} />
              {typeof article.commentCount === 'number' && (
                <Text style={[type.caption, { color: theme.inkMuted, marginLeft: 4 }]}>{article.commentCount}</Text>
              )}
            </Pressable>
            <Pressable
              hitSlop={(layout.touchTarget - 20) / 2}
              onPress={() => toggleSaved(article)}
              accessibilityLabel={isSaved ? 'Remove from saved' : 'Save article'}
            >
              <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? theme.accent : theme.inkMuted} />
            </Pressable>
            <Pressable hitSlop={(layout.touchTarget - 20) / 2} accessibilityLabel="Share article">
              <Feather name="share" size={20} color={theme.inkMuted} />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrap: { marginBottom: layout.sectionGap, borderRadius: radius.card },
  card: { borderRadius: radius.card, overflow: 'hidden' },
  hero: { height: 220 },
  body: { padding: layout.heroCardPadding },
  toolbar: { flexDirection: 'row', gap: space.lg, marginTop: space.lg },
  toolbarItem: { flexDirection: 'row', alignItems: 'center' },
});
