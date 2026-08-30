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
  onListen?: () => void;
  onShare?: () => void;
};

export function ArticleCard({ article, onPress, onListen, onShare }: Props) {
  const { theme } = useTheme();
  const { authUser, savedArticleIds, toggleSaved, language } = useAppState();
  const isSaved = savedArticleIds.includes(article.id);
  const isSpeaking = useIsSpeaking(article.id);
  const [listenLoading, setListenLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Save, listen, and download are all account-backed (bookmarks/history sync server-side, TTS
  // has no meaningful "guest" state to persist) — a guest tapping any of them is routed to sign in
  // instead of silently no-op'ing or acting on state that'll vanish.
  const requireAuth = (action: () => void) => {
    if (authUser) action();
    else navigation.navigate('Auth', { mode: 'login' });
  };

  const listenAction = onListen ?? (() => listenToArticle(article, language, setListenLoading));
  const listen = () => requireAuth(listenAction);
  const share = onShare ?? (() => Share.share({ message: article.sourceUrl ? `${article.headline}\n\n${article.sourceUrl}` : `${article.headline}\n\n${article.dek}` }));
  // Bug found live: this icon had no onPress at all, so the tap fell through to the card's own
  // onPress and just opened the article — never actually reaching the comments section.
  const openComments = () => navigation.navigate('ArticleReader', { articleId: article.id, scrollToComments: true });

  return (
    <Pressable onPress={onPress} style={[styles.card, { borderBottomColor: theme.rule }]}>
      <View style={styles.hero}>
        <ArticleImage article={article} style={StyleSheet.absoluteFill} />
        {!!article.featuredVideoId && <VideoPlayBadge />}
      </View>
      <View style={styles.body}>
        {article.isLive ? <LiveBadge /> : article.isPremium ? <PremiumBadge /> : null}
        <Text style={[type.sectionHeadline, { color: theme.ink, marginTop: space.sm }]} numberOfLines={3}>
          {article.headline}
        </Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]} numberOfLines={2}>
          {article.dek}
        </Text>
        <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.sm }]}>
          {article.authorName.toUpperCase()} · {article.publishedAt} · {article.readTime}
        </Text>
        <View style={styles.toolbar}>
          <Pressable
            hitSlop={(layout.touchTarget - 20) / 2}
            style={styles.toolbarItem}
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
            style={styles.toolbarItem}
            onPress={() => requireAuth(() => toggleSaved(article))}
            accessibilityLabel={isSaved ? 'Remove from saved' : 'Save article'}
          >
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? theme.accent : theme.inkMuted} />
          </Pressable>
          <Pressable
            hitSlop={(layout.touchTarget - 20) / 2}
            style={styles.toolbarItem}
            onPress={share}
            accessibilityLabel="Share article"
          >
            <Feather name="share" size={20} color={theme.inkMuted} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderBottomWidth: 1, paddingBottom: space.lg, marginBottom: space.lg },
  hero: { height: 240 },
  body: { padding: space.lg },
  toolbar: { flexDirection: 'row', gap: space.lg, marginTop: space.md },
  toolbarItem: { flexDirection: 'row', alignItems: 'center' },
});
