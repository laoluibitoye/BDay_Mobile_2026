import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ArticleImage } from '../../components/ArticleImage';
import { GlassSheet } from '../../components/GlassSheet';
import { PremiumBadge } from '../../components/Badge';
import { ReaderControls } from '../../components/ReaderControls';
import { SiaPanel } from '../../components/SiaPanel';
import { articles, authors, breakingArticle, commentsForArticle } from '../../data/mock';
import { Comment } from '../../data/types';
import { LANGUAGES } from '../../data/languages';
import { useAppState } from '../../state/AppState';
import { layout, radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticleReader'>;

export function ArticleReaderScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const [fontScale, setFontScale] = useState(0);
  const [isTranslated, setIsTranslated] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const {
    isSubscribed,
    freeArticlesUsed,
    freeArticlesLimit,
    useFreeArticle,
    savedArticleIds,
    toggleSaved,
    language,
    recordView,
    profile,
  } = useAppState();
  const languageLabel = LANGUAGES.find((l) => l.code === language)?.label ?? language;
  const article =
    [...articles, breakingArticle].find((a) => a.id === route.params.articleId) ?? articles[0];
  const author = authors.find((a) => a.id === article.authorId);
  const isSaved = savedArticleIds.includes(article.id);

  const [threadComments, setThreadComments] = useState<Comment[]>(() => commentsForArticle(article.id));
  const [commentDraft, setCommentDraft] = useState('');

  const isLocked = article.isPremium && !isSubscribed && freeArticlesUsed >= freeArticlesLimit;

  useEffect(() => {
    if (article.isPremium && !isSubscribed && !isLocked) useFreeArticle();
    recordView(article.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id]);

  const visibleParagraphs = isLocked ? article.body.slice(0, 1) : article.body;

  const jumpToComments = () => scrollRef.current?.scrollToEnd({ animated: true });

  const postComment = () => {
    if (!commentDraft.trim()) return;
    setThreadComments((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        articleId: article.id,
        author: profile.name,
        avatarColor: theme.accent,
        body: commentDraft.trim(),
        postedAt: 'Just now',
      },
    ]);
    setCommentDraft('');
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen scrollRef={scrollRef}>
        <AppHeader variant="compact" showBack />
        <View style={styles.actionRow}>
          <Pressable
            hitSlop={8}
            accessibilityLabel="Listen to this article"
            onPress={() =>
              Alert.alert('Listen to article', "Audio playback isn't available in this preview build yet.")
            }
          >
            <Feather name="headphones" size={20} color={theme.inkMuted} />
          </Pressable>
          <Pressable
            hitSlop={8}
            accessibilityLabel={`${threadComments.length} comments, jump to comments`}
            onPress={jumpToComments}
            style={styles.commentAction}
          >
            <Feather name="message-circle" size={20} color={theme.inkMuted} />
            {threadComments.length > 0 && (
              <Text style={[type.caption, { color: theme.inkMuted, marginLeft: 4 }]}>{threadComments.length}</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => toggleSaved(article.id)}
            hitSlop={8}
            accessibilityLabel={isSaved ? 'Remove from saved' : 'Save article'}
          >
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? theme.accent : theme.inkMuted} />
          </Pressable>
          <Pressable
            hitSlop={8}
            accessibilityLabel="Share article"
            onPress={() => Share.share({ message: `${article.headline}\n\n${article.dek}` })}
          >
            <Feather name="share" size={20} color={theme.inkMuted} />
          </Pressable>
          <Pressable
            onPress={() => (language === 'en' ? navigation.navigate('Language') : setIsTranslated((v) => !v))}
            hitSlop={8}
            accessibilityLabel="Translate"
          >
            <Feather name="globe" size={20} color={isTranslated ? theme.accent : theme.inkMuted} />
          </Pressable>
        </View>

        <View style={{ padding: space.lg }}>
          {isTranslated && (
            <View style={[styles.translateBanner, { backgroundColor: theme.accentTint, borderColor: theme.accent }]}>
              <Feather name="globe" size={14} color={theme.accentDeep} />
              <Text style={[type.caption, { color: theme.accentDeep, marginLeft: space.xs, flex: 1 }]}>
                Machine-translated preview · {languageLabel}. Full-article translation is coming in a later release.
              </Text>
            </View>
          )}
          {article.isPremium && <PremiumBadge />}
          <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.sm }]}>
            {article.section.toUpperCase()}
          </Text>
          <Text style={[type.displayHeadline, { color: theme.ink, marginTop: space.xs }]}>{article.headline}</Text>
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.md }]}>{article.dek}</Text>
          <Pressable
            onPress={() => author && navigation.navigate('ColumnistPage', { authorId: author.id })}
            accessibilityRole="button"
            accessibilityLabel={author ? `View ${author.name}'s columnist page` : undefined}
            hitSlop={8}
          >
            <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.md }]}>
              BY <Text style={{ color: theme.accentDeep }}>{author?.name.toUpperCase()}</Text> · {article.publishedAt} ·{' '}
              {article.readTime}
            </Text>
          </Pressable>

          <ArticleImage article={article} style={styles.featuredImage} />

          <ReaderControls fontScale={fontScale} onFontScaleChange={setFontScale} />

          <View style={{ marginTop: space.xl, gap: space.lg }}>
            {visibleParagraphs.map((p, i) => (
              <Text
                key={i}
                style={[
                  type.bodyReading,
                  {
                    color: theme.ink,
                    fontSize: type.bodyReading.fontSize + fontScale,
                    lineHeight: type.bodyReading.lineHeight + fontScale * 1.6,
                  },
                ]}
              >
                {p}
              </Text>
            ))}
          </View>

          {isLocked && (
            <View style={styles.lockCardWrap}>
              <GlassSheet variant="card" style={styles.lockCard}>
                <Text style={[type.sectionHeadline, { color: theme.ink }]}>
                  Full sector analysis and continued reporting
                </Text>
                <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
                  You've used {freeArticlesUsed} of {freeArticlesLimit} free premium stories this month.
                </Text>
                <Pressable
                  style={[styles.unlockButton, { backgroundColor: theme.accent }]}
                  onPress={() => navigation.navigate('Paywall')}
                >
                  <Text style={[type.label, { color: '#fff' }]}>Unlock Unlimited Access</Text>
                </Pressable>
              </GlassSheet>
            </View>
          )}

          {/* Mirrors the WordPress site's own comment thread for this post — posting here is
              local-only until a real WP REST `comments` integration lands (IMPLEMENTATION_PLAN.md §9). */}
          <View style={styles.commentsSection}>
            <Text style={[type.sectionHeadline, { color: theme.ink }]}>
              Comments {threadComments.length > 0 ? `(${threadComments.length})` : ''}
            </Text>

            {threadComments.length === 0 ? (
              <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
                No comments yet — be the first to share your thoughts.
              </Text>
            ) : (
              <View style={{ marginTop: space.md, gap: space.lg }}>
                {threadComments.map((c) => (
                  <View key={c.id} style={styles.commentRow}>
                    <View style={[styles.commentAvatar, { backgroundColor: c.avatarColor }]}>
                      <Text style={[type.caption, { color: '#fff' }]}>{c.author.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[type.label, { color: theme.ink }]}>
                        {c.author} <Text style={[type.caption, { color: theme.inkFaint }]}>· {c.postedAt}</Text>
                      </Text>
                      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: 2 }]}>{c.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.commentInputRow, { borderColor: theme.rule }]}>
              <TextInput
                value={commentDraft}
                onChangeText={setCommentDraft}
                placeholder="Add a comment..."
                placeholderTextColor={theme.inkFaint}
                style={[type.bodyUI, { flex: 1, color: theme.ink }]}
                multiline
                onSubmitEditing={postComment}
              />
              <Pressable onPress={postComment} accessibilityRole="button" accessibilityLabel="Post comment">
                <Feather name="send" size={20} color={theme.accent} />
              </Pressable>
            </View>
          </View>
        </View>
      </Screen>

      {!isLocked && <SiaPanel articleHeadline={article.headline} />}
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  commentAction: { flexDirection: 'row', alignItems: 'center' },
  featuredImage: { height: 220, borderRadius: radius.card, marginTop: space.lg },
  translateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: space.sm,
    marginBottom: space.md,
  },
  lockCardWrap: { marginTop: space.xl },
  lockCard: { padding: space.lg },
  unlockButton: { borderRadius: 8, paddingVertical: space.md, alignItems: 'center', marginTop: space.lg },
  commentsSection: { marginTop: layout.sectionGap, paddingTop: space.lg, borderTopWidth: 1, borderColor: '#00000014' },
  commentRow: { flexDirection: 'row', gap: space.md },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginTop: space.lg,
  },
});
