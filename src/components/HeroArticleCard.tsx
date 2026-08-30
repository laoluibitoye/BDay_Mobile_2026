import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Article } from '../data/types';
import { useAppState } from '../state/AppState';
import { useIsSpeaking } from '../hooks/useIsSpeaking';
import { listenToArticle } from '../lib/listenToArticle';
import { layout, space, type, useTheme } from '../theme';
import { ArticleImage } from './ArticleImage';
import { LiveBadge, PremiumBadge } from './Badge';
import { VideoPlayBadge } from './VideoPlayBadge';

type Props = {
  article: Article;
  onPress: () => void;
};

// design.md §6 "Hero article card" — the single raised card on Today; everything else stays flat.
// Shadow lives on an outer wrapper (no overflow:hidden) so iOS doesn't clip it; the inner
// View owns the rounded corners + overflow:hidden for the hero image.
export function HeroArticleCard({ article, onPress }: Props) {
  const { theme } = useTheme();
  const { authUser, savedArticleIds, toggleSaved, language } = useAppState();
  const isSaved = savedArticleIds.includes(article.id);
  const isSpeaking = useIsSpeaking(article.id);
  const [listenLoading, setListenLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Save/listen/download are account-backed — see ArticleCard.tsx's requireAuth for why a guest
  // gets routed to sign in instead of the action running.
  const requireAuth = (action: () => void) => {
    if (authUser) action();
    else navigation.navigate('Auth', { mode: 'login' });
  };

  // Bug found live: these three toolbar buttons had no onPress at all, so the tap fell through to
  // the card's own onPress (navigate into the article) instead of doing anything — see
  // ArticleCard.tsx for the pattern these now match exactly.
  const listen = () => requireAuth(() => listenToArticle(article, language, setListenLoading));
  const share = () =>
    Share.share({
      message: article.sourceUrl ? `${article.headline}\n\n${article.sourceUrl}` : `${article.headline}\n\n${article.dek}`,
    });
  const openComments = () => navigation.navigate('ArticleReader', { articleId: article.id, scrollToComments: true });

  return (
    <Pressable onPress={onPress} style={[styles.card, { borderBottomColor: theme.rule }]}>
      <View>
        <View style={styles.hero}>
          <ArticleImage article={article} style={StyleSheet.absoluteFill} />
          {!!article.featuredVideoId && <VideoPlayBadge />}
        </View>
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
            <Pressable
              hitSlop={(layout.touchTarget - 20) / 2}
              onPress={listen}
              disabled={listenLoading}
              accessibilityLabel={isSpeaking ? 'Stop listening' : 'Listen to this article'}
            >
              {listenLoading ? (
                <ActivityIndicator size="small" color={theme.inkMuted} />
              ) : (
                <Feather name={isSpeaking ? 'pause-circle' : 'headphones'} size={20} color={isSpeaking ? theme.accent : theme.inkMuted} />
              )}
            </Pressable>
            <Pressable
              hitSlop={(layout.touchTarget - 20) / 2}
              style={styles.toolbarItem}
              onPress={openComments}
              accessibilityLabel="Comments"
            >
              <Feather name="message-circle" size={20} color={theme.inkMuted} />
              {typeof article.commentCount === 'number' && (
                <Text style={[type.caption, { color: theme.inkMuted, marginLeft: 4 }]}>{article.commentCount}</Text>
              )}
            </Pressable>
            <Pressable
              hitSlop={(layout.touchTarget - 20) / 2}
              onPress={() => requireAuth(() => toggleSaved(article))}
              accessibilityLabel={isSaved ? 'Remove from saved' : 'Save article'}
            >
              <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? theme.accent : theme.inkMuted} />
            </Pressable>
            <Pressable hitSlop={(layout.touchTarget - 20) / 2} onPress={share} accessibilityLabel="Share article">
              <Feather name="share" size={20} color={theme.inkMuted} />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: layout.sectionGap, borderBottomWidth: 1, paddingBottom: layout.heroCardPadding },
  hero: { height: 270 },
  body: { padding: layout.heroCardPadding },
  toolbar: { flexDirection: 'row', gap: space.lg, marginTop: space.lg },
  toolbarItem: { flexDirection: 'row', alignItems: 'center' },
});
