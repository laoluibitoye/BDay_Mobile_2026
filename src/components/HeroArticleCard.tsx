import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import YoutubePlayer from 'react-native-youtube-iframe';
import type { RootStackParamList } from '../navigation/types';
import { Article } from '../data/types';
import { useAppState } from '../state/AppState';
import { useIsSpeaking } from '../hooks/useIsSpeaking';
import { listenToArticle } from '../lib/listenToArticle';
import { layout, space, type, useTheme } from '../theme';
import { ArticleImage } from './ArticleImage';

type Props = {
  article: Article;
  onPress: () => void;
};

// The single lead story on Today — a flat, borderless row (the flat-card redesign removed the
// raised shadow design.md §6 originally specified here; a bottom hairline is now the only
// separator, same language as ArticleCard).
export function HeroArticleCard({ article, onPress }: Props) {
  const { theme } = useTheme();
  const { authUser, savedArticleIds, toggleSaved, language } = useAppState();
  const isSaved = savedArticleIds.includes(article.id);
  const isSpeaking = useIsSpeaking(article.id);
  const [listenLoading, setListenLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // `card`/`hero` have no horizontal padding of their own, but the card isn't actually
  // full-bleed to the screen — HomeScreen's FlatList wraps every card in
  // `contentContainerStyle={{ padding: space.lg }}`, so the real available width is the window
  // width minus that padding on both sides. ArticleImage (StyleSheet.absoluteFill) just fills
  // whatever width it's given, so this only ever showed up with the video: react-native-
  // youtube-iframe needs a concrete numeric width/height, and hardcoding it to the full window
  // width overflowed past the list's own right padding, leaving the video flush against the
  // right edge while the left edge stayed at the padded container's inset.
  const { width: windowWidth } = useWindowDimensions();
  const heroVideoWidth = windowWidth - space.lg * 2;
  const heroVideoHeight = (heroVideoWidth * 9) / 16;
  // react-native-youtube-iframe sends its `play`/`mute` postMessage commands in prop-declaration
  // order (play before mute) the instant the player reports ready — both starting `true`
  // statically meant the browser's autoplay policy sometimes saw an unmuted playVideo() call
  // arrive a beat before the mute command landed, silently blocked it, and left YouTube's own
  // click-to-play fallback showing instead of a playing video. `mute` alone is safe to leave
  // `true` from the first render (nothing plays yet, so there's no autoplay-policy check to
  // fail); `play` only flips on once onReady fires and that mute command has had a moment to
  // actually land webview-side.
  const [videoReady, setVideoReady] = useState(false);

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
          {article.featuredVideoId ? (
            // Website parity (script.js's bdayInitFeaturedVideoCards): the lead story's video
            // autoplays muted and looping as soon as the feed loads, instead of sitting as a
            // static thumbnail with a play button the reader has to tap first. `pointerEvents:
            // 'none'` on the underlying webview keeps a tap here reaching the card's own
            // onPress (open the article) rather than the player swallowing it.
            <YoutubePlayer
              height={heroVideoHeight}
              width={heroVideoWidth}
              videoId={article.featuredVideoId}
              play={videoReady}
              mute
              useLocalHTML
              baseUrlOverride={process.env.EXPO_PUBLIC_WP_BASE_URL}
              onReady={() => setTimeout(() => setVideoReady(true), 200)}
              initialPlayerParams={{ loop: true, controls: false, rel: false }}
              webViewProps={{ pointerEvents: 'none' }}
            />
          ) : (
            <ArticleImage article={article} style={StyleSheet.absoluteFill} />
          )}
        </View>
        <View style={styles.body}>
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
  hero: { aspectRatio: 16 / 9 },
  body: { padding: layout.heroCardPadding },
  toolbar: { flexDirection: 'row', gap: space.lg, marginTop: space.lg },
  toolbarItem: { flexDirection: 'row', alignItems: 'center' },
});
