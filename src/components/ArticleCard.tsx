import React from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Article } from '../data/types';
import { useAppState } from '../state/AppState';
import { useIsSpeaking } from '../hooks/useIsSpeaking';
import { toggleSpeak } from '../lib/tts';
import { layout, radius, space, type, useTheme } from '../theme';
import { ArticleImage } from './ArticleImage';
import { LiveBadge, PremiumBadge } from './Badge';

type Props = {
  article: Article;
  onPress: () => void;
  onListen?: () => void;
  onShare?: () => void;
};

export function ArticleCard({ article, onPress, onListen, onShare }: Props) {
  const { theme } = useTheme();
  const { savedArticleIds, toggleSaved, language } = useAppState();
  const isSaved = savedArticleIds.includes(article.id);
  const isSpeaking = useIsSpeaking(article.id);

  const listen = onListen ?? (() => toggleSpeak(article.id, `${article.headline}. ${article.dek}`, language));
  const share = onShare ?? (() => Share.share({ message: article.sourceUrl ? `${article.headline}\n\n${article.sourceUrl}` : `${article.headline}\n\n${article.dek}` }));

  return (
    <Pressable onPress={onPress} style={[styles.card, { borderColor: theme.rule, backgroundColor: theme.bgCard }]}>
      <ArticleImage article={article} style={styles.hero} />
      <View style={styles.body}>
        {article.isLive ? <LiveBadge /> : article.isPremium ? <PremiumBadge /> : null}
        <Text style={[type.articleHeadline, { color: theme.ink, marginTop: space.sm }]} numberOfLines={3}>
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
            accessibilityLabel={isSpeaking ? 'Stop listening' : 'Listen to this article'}
          >
            <Feather name={isSpeaking ? 'pause-circle' : 'headphones'} size={20} color={isSpeaking ? theme.accent : theme.inkMuted} />
          </Pressable>
          <Pressable hitSlop={(layout.touchTarget - 20) / 2} style={styles.toolbarItem} accessibilityLabel="Comments">
            <Feather name="message-circle" size={20} color={theme.inkMuted} />
            {typeof article.commentCount === 'number' && (
              <Text style={[type.caption, { color: theme.inkMuted, marginLeft: 4 }]}>{article.commentCount}</Text>
            )}
          </Pressable>
          <Pressable
            hitSlop={(layout.touchTarget - 20) / 2}
            style={styles.toolbarItem}
            onPress={() => toggleSaved(article)}
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
  card: { borderWidth: 1, borderRadius: radius.card, overflow: 'hidden', marginBottom: space.lg },
  hero: { height: 190 },
  body: { padding: space.lg },
  toolbar: { flexDirection: 'row', gap: space.lg, marginTop: space.md },
  toolbarItem: { flexDirection: 'row', alignItems: 'center' },
});
