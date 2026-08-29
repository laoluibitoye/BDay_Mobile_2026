import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ArticleImage } from '../../components/ArticleImage';
import { GlassSheet } from '../../components/GlassSheet';
import { PremiumBadge } from '../../components/Badge';
import { ReaderControls } from '../../components/ReaderControls';
import { SiaPanel } from '../../components/SiaPanel';
import { AdSlot } from '../../components/AdSlot';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { LANGUAGES } from '../../data/languages';
import type { Article } from '../../data/types';
import { useAppState } from '../../state/AppState';
import { useAppConfig } from '../../hooks/useAppConfig';
import { useIsSpeaking } from '../../hooks/useIsSpeaking';
import { getArticleEntitlement } from '../../lib/api/entitlement';
import { getRegisteredArticle } from '../../lib/api/content';
import { createGiftLink, giftUrl } from '../../lib/api/gift';
import { getComments, postComment, deleteComment, type CommentView } from '../../lib/api/comments';
import { ApiError } from '../../lib/api/client';
import type { ArticleEntitlement, EntitlementStage } from '../../lib/api/types';
import { htmlToParagraphs } from '../../lib/htmlToText';
import { toggleSpeak } from '../../lib/tts';
import { getOfflineArticle, removeArticleOffline, saveArticleOffline } from '../../lib/offlineArticles';
import { layout, radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticleReader'>;

// Every article shown here was registered by a real feed fetch before the reader navigated to it
// (Home/SectionFeed/Search/etc. all call registerArticles()/registerArticle() on real results) —
// an unregistered id means a stale/broken deep link, not a legitimate article to fabricate a
// stand-in for.
export function ArticleReaderScreen({ route, navigation }: Props) {
  const article = getRegisteredArticle(route.params.articleId);
  if (!article) {
    return (
      <Screen>
        <AppHeader variant="compact" showBack />
        <FeedEmptyState title="Article not found" message="This article may have been removed or the link is out of date." />
      </Screen>
    );
  }
  return <ArticleReaderView article={article} navigation={navigation} scrollToComments={route.params.scrollToComments} />;
}

function ArticleReaderView({
  article,
  navigation,
  scrollToComments,
}: {
  article: Article;
  navigation: Props['navigation'];
  scrollToComments?: boolean;
}) {
  const { theme } = useTheme();
  const [fontScale, setFontScale] = useState(0);
  const [isTranslated, setIsTranslated] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const {
    authUser,
    isSubscribed,
    savedArticleIds,
    toggleSaved,
    language,
    recordView,
    downloadedArticleIds,
    toggleDownload,
  } = useAppState();
  const appConfig = useAppConfig();
  const languageLabel = LANGUAGES.find((l) => l.code === language)?.label ?? language;
  const isSaved = savedArticleIds.includes(article.id);
  const isDownloaded = downloadedArticleIds.includes(article.id);

  const [comments, setComments] = useState<CommentView[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [nextCommentsCursor, setNextCommentsCursor] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string } | null>(null);
  const [postingComment, setPostingComment] = useState(false);
  // Session-only "did I post this" tracking — the server never exposes a userId/ownership
  // marker on a comment (CommentView.author is display-name-only), so this mirrors the web SDK's
  // comments.ts `mineIds` Set exactly: only a comment posted this session shows a delete button.
  const mineIds = useRef<Set<string>>(new Set());
  const [entitlement, setEntitlement] = useState<ArticleEntitlement | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [gifting, setGifting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Populated only when the live entitlement fetch fails (no connection) and this article was
  // previously downloaded — the offline copy is otherwise never consulted, since the live
  // endpoint is always the freshest, authoritative source when it's reachable.
  const [offlineParagraphs, setOfflineParagraphs] = useState<string[] | null>(null);
  const isSpeaking = useIsSpeaking(article.id);

  useEffect(() => {
    recordView(article);
    getArticleEntitlement(article.id)
      .then(setEntitlement)
      .catch(() => {
        setEntitlement(null);
        getOfflineArticle(article.id).then((cached) => setOfflineParagraphs(cached?.paragraphs ?? null));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id]);

  useEffect(() => {
    setCommentsLoading(true);
    mineIds.current = new Set();
    getComments(article.id)
      .then((page) => {
        setComments(page.comments);
        setNextCommentsCursor(page.nextCursor);
      })
      .catch(() => {
        setComments([]);
        setNextCommentsCursor(null);
      })
      .finally(() => setCommentsLoading(false));
  }, [article.id]);

  const totalCommentCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  const loadMoreComments = useCallback(() => {
    if (!nextCommentsCursor) return;
    getComments(article.id, nextCommentsCursor)
      .then((page) => {
        setComments((prev) => [...prev, ...page.comments]);
        setNextCommentsCursor(page.nextCursor);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id, nextCommentsCursor]);

  const submitComment = async () => {
    const body = commentDraft.trim();
    if (!body || postingComment) return;
    setPostingComment(true);
    const parentId = replyingTo?.id;
    try {
      const created = await postComment({ postId: article.id, body, parentId });
      mineIds.current.add(created.id);
      setComments((prev) =>
        parentId
          ? prev.map((c) => (c.id === parentId ? { ...c, replies: [...c.replies, created] } : c))
          : [created, ...prev]
      );
      setCommentDraft('');
      setReplyingTo(null);
    } catch (e) {
      Alert.alert(
        'Could not post comment',
        e instanceof ApiError && e.status === 401 ? 'Log in to comment.' : 'Something went wrong. Try again.'
      );
    } finally {
      setPostingComment(false);
    }
  };

  const removeComment = async (id: string, parentId: string | null) => {
    try {
      await deleteComment(id);
      setComments((prev) =>
        parentId
          ? prev.map((c) => (c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== id) } : c))
          : prev.filter((c) => c.id !== id)
      );
    } catch {
      Alert.alert('Could not remove comment', 'Something went wrong. Try again.');
    }
  };

  const stage: EntitlementStage = entitlement?.stage ?? (article.isPremium && !isSubscribed ? 'paid_lock' : 'open');
  const isLocked = stage !== 'open';

  // Offline fallback only ever applies to the unlocked, full-content case — a downloaded article
  // was only ever cached while genuinely open (see toggleDownloaded below), so there's nothing to
  // fall back to for a locked one, and no reason to: the paywall/register/profile prompt itself
  // needs no network to render.
  const visibleParagraphs =
    !entitlement && !isLocked && offlineParagraphs
      ? offlineParagraphs
      : htmlToParagraphs((isLocked ? entitlement?.preview : entitlement?.content) ?? '');

  // Save/listen/download are account-backed — see ArticleCard.tsx's requireAuth for why a guest
  // gets routed to sign in instead of the action running.
  const requireAuth = (action: () => void) => {
    if (authUser) action();
    else navigation.navigate('Auth', { mode: 'login' });
  };

  const toggleDownloaded = async () => {
    if (isDownloaded) {
      await removeArticleOffline(article.id);
      toggleDownload(article.id);
      return;
    }
    if (isLocked || visibleParagraphs.length === 0) return;
    setDownloading(true);
    try {
      await saveArticleOffline(article, visibleParagraphs);
      toggleDownload(article.id);
    } finally {
      setDownloading(false);
    }
  };

  const jumpToComments = () => scrollRef.current?.scrollToEnd({ animated: true });

  // Bug found live: the "Comments" toolbar icon on ArticleCard/HeroArticleCard (every feed, plus
  // the Today hero slot) had no onPress at all, so the tap fell through to the card's own
  // onPress and just opened the article like any other tap — never actually reaching the
  // comments section. Those now navigate here with scrollToComments: true instead. Waits for
  // comments to finish loading (not just article mount) since scrollToEnd before the comments
  // section has rendered its real height would undershoot.
  useEffect(() => {
    if (scrollToComments && !commentsLoading) jumpToComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToComments, commentsLoading]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    setReadProgress(scrollable > 0 ? Math.min(1, Math.max(0, contentOffset.y / scrollable)) : 0);
  };

  const listen = () =>
    requireAuth(() => {
      const text = `${article.headline}. ${visibleParagraphs.join(' ')}`;
      toggleSpeak(article.id, text, article.headline, language);
    });

  const shareArticle = () => {
    Share.share({
      message: article.sourceUrl ? `${article.headline}\n\n${article.sourceUrl}` : `${article.headline}\n\n${article.dek}`,
    });
  };

  const giftArticle = async () => {
    if (!article.sourceUrl) {
      Alert.alert('Gift this article', "Gifting isn't available for this article yet.");
      return;
    }
    setGifting(true);
    try {
      const link = await createGiftLink(article.id);
      await Share.share({
        message: `I thought you'd like this — read it free, on me: ${giftUrl(article.sourceUrl, link.token)}`,
      });
    } catch (e) {
      Alert.alert(
        'Could not create gift link',
        e instanceof ApiError && e.status === 401 ? 'Log in to gift an article.' : 'Something went wrong. Try again.'
      );
    } finally {
      setGifting(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen
        scrollRef={scrollRef}
        onScroll={onScroll}
        header={
          // Stays fixed above the scroll (Screen's `header` prop renders outside the
          // ScrollView), so progress stays visible the whole time reading — unlike everything
          // else on this screen, which intentionally scrolls away for more reading room.
          <View style={[styles.progressTrack, { backgroundColor: theme.rule }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${readProgress * 100}%` }]} />
          </View>
        }
      >
        <AppHeader variant="compact" showBack />
        <View style={styles.actionRow}>
          <Pressable
            hitSlop={8}
            accessibilityLabel={isSpeaking ? 'Stop listening' : 'Listen to this article'}
            onPress={listen}
          >
            <Feather name={isSpeaking ? 'pause-circle' : 'headphones'} size={20} color={isSpeaking ? theme.accent : theme.inkMuted} />
          </Pressable>
          <Pressable
            hitSlop={8}
            accessibilityLabel={`${totalCommentCount} comments, jump to comments`}
            onPress={jumpToComments}
            style={styles.commentAction}
          >
            <Feather name="message-circle" size={20} color={theme.inkMuted} />
            {totalCommentCount > 0 && (
              <Text style={[type.caption, { color: theme.inkMuted, marginLeft: 4 }]}>{totalCommentCount}</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => requireAuth(() => toggleSaved(article))}
            hitSlop={8}
            accessibilityLabel={isSaved ? 'Remove from saved' : 'Save article'}
          >
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? theme.accent : theme.inkMuted} />
          </Pressable>
          <Pressable hitSlop={8} accessibilityLabel="Share article" onPress={shareArticle}>
            <Feather name="share" size={20} color={theme.inkMuted} />
          </Pressable>
          <Pressable hitSlop={8} accessibilityLabel="Gift this article" onPress={giftArticle} disabled={gifting}>
            <Feather name="gift" size={20} color={gifting ? theme.inkFaint : theme.inkMuted} />
          </Pressable>
          <Pressable
            hitSlop={8}
            accessibilityLabel={isDownloaded ? 'Remove downloaded copy' : 'Download for offline'}
            onPress={() => requireAuth(toggleDownloaded)}
            disabled={downloading || (!isDownloaded && (isLocked || visibleParagraphs.length === 0))}
          >
            <Feather
              name={isDownloaded ? 'check-circle' : 'download'}
              size={20}
              color={isDownloaded ? theme.accent : downloading ? theme.inkFaint : theme.inkMuted}
            />
          </Pressable>
          {/* Translate toolbar button removed — language/translation is deprecated for now (see
              LanguageScreen/isTranslated, left in place but unreachable from here). */}
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
            onPress={() => navigation.navigate('ColumnistPage', { authorId: article.authorId })}
            accessibilityRole="button"
            accessibilityLabel={`View ${article.authorName}'s columnist page`}
            hitSlop={8}
          >
            <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.md }]}>
              BY <Text style={{ color: theme.accentDeep }}>{article.authorName.toUpperCase()}</Text> · {article.publishedAt} ·{' '}
              {article.readTime}
            </Text>
          </Pressable>

          {article.featuredVideoId ? (
            <View style={styles.featuredImage}>
              <WebView
                source={{ uri: `https://www.youtube.com/embed/${article.featuredVideoId}?playsinline=1` }}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                style={{ backgroundColor: 'transparent' }}
              />
            </View>
          ) : (
            <ArticleImage article={article} style={styles.featuredImage} />
          )}

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
                {(() => {
                  // Stage-specific copy is editorially managed (wp-admin → BusinessDay App →
                  // Paywall Copy) — it only changes wording, never the gating decision itself,
                  // which always comes live from AeroPaywall's `stage`.
                  // `isLocked` (this block's guard) is derived from `stage !== 'open'`, so TS
                  // already narrows `stage` here to the three locked stages.
                  const copy = appConfig?.paywallCopy[stage];
                  const fallback = {
                    register_prompt: { headline: 'Create a free account to keep reading', body: 'Sign up to continue.', buttonLabel: 'Sign up free' },
                    profile_prompt: { headline: 'Complete your profile', body: 'Tell us a bit more about you to keep reading free articles.', buttonLabel: 'Complete profile' },
                    paid_lock: { headline: 'Subscribe to keep reading', body: 'This story is for subscribers. Unlock unlimited access to BusinessDay.', buttonLabel: 'See plans' },
                  } as const;
                  const resolved = copy ?? fallback[stage];
                  const onPress = () => {
                    if (stage === 'register_prompt') navigation.navigate('Auth', { mode: 'signup' });
                    else if (stage === 'profile_prompt') navigation.navigate('Profile');
                    else navigation.navigate('Paywall');
                  };
                  return (
                    <>
                      <Text style={[type.sectionHeadline, { color: theme.ink }]}>{resolved.headline}</Text>
                      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>{resolved.body}</Text>
                      <Pressable style={[styles.unlockButton, { backgroundColor: theme.accent }]} onPress={onPress}>
                        <Text style={[type.label, { color: '#fff' }]}>{resolved.buttonLabel}</Text>
                      </Pressable>
                    </>
                  );
                })()}
              </GlassSheet>
            </View>
          )}

          {!isLocked && <AdSlot placement="article_body" />}

          {/* Real subscription-service comment thread for this post (comments.ts) — public to
              read, signed-in to post/reply/delete. One reply level deep, matching the backend's
              own cap. */}
          <View style={styles.commentsSection}>
            <Text style={[type.sectionHeadline, { color: theme.ink }]}>
              Comments {totalCommentCount > 0 ? `(${totalCommentCount})` : ''}
            </Text>

            {commentsLoading ? (
              <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>Loading comments…</Text>
            ) : comments.length === 0 ? (
              <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>
                No comments yet — be the first to share your thoughts.
              </Text>
            ) : (
              <View style={{ marginTop: space.md, gap: space.lg }}>
                {comments.map((c) => (
                  <View key={c.id}>
                    <View style={styles.commentRow}>
                      <View style={[styles.commentAvatar, { backgroundColor: theme.accent }]}>
                        <Text style={[type.caption, { color: '#fff' }]}>
                          {c.author.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[type.label, { color: theme.ink }]}>
                          {c.author.displayName}{' '}
                          <Text style={[type.caption, { color: theme.inkFaint }]}>
                            · {new Date(c.createdAt).toLocaleDateString()}
                          </Text>
                        </Text>
                        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: 2 }]}>{c.body}</Text>
                        <View style={{ flexDirection: 'row', gap: space.lg, marginTop: space.xs }}>
                          <Pressable
                            onPress={() => setReplyingTo({ id: c.id, authorName: c.author.displayName })}
                            hitSlop={8}
                            accessibilityRole="button"
                          >
                            <Text style={[type.caption, { color: theme.accentDeep }]}>Reply</Text>
                          </Pressable>
                          {mineIds.current.has(c.id) && (
                            <Pressable onPress={() => removeComment(c.id, null)} hitSlop={8} accessibilityRole="button">
                              <Text style={[type.caption, { color: theme.marketDown }]}>Delete</Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    </View>

                    {c.replies.length > 0 && (
                      <View style={{ marginTop: space.md, marginLeft: 44, gap: space.md }}>
                        {c.replies.map((r) => (
                          <View key={r.id} style={styles.commentRow}>
                            <View style={[styles.commentAvatar, { backgroundColor: theme.inkMuted, width: 26, height: 26, borderRadius: 13 }]}>
                              <Text style={[type.caption, { color: '#fff' }]}>
                                {r.author.displayName.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[type.label, { color: theme.ink }]}>
                                {r.author.displayName}{' '}
                                <Text style={[type.caption, { color: theme.inkFaint }]}>
                                  · {new Date(r.createdAt).toLocaleDateString()}
                                </Text>
                              </Text>
                              <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: 2 }]}>{r.body}</Text>
                              {mineIds.current.has(r.id) && (
                                <Pressable
                                  onPress={() => removeComment(r.id, c.id)}
                                  hitSlop={8}
                                  accessibilityRole="button"
                                  style={{ marginTop: space.xs, alignSelf: 'flex-start' }}
                                >
                                  <Text style={[type.caption, { color: theme.marketDown }]}>Delete</Text>
                                </Pressable>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}

                {nextCommentsCursor && (
                  <Pressable onPress={loadMoreComments} hitSlop={8} accessibilityRole="button" style={{ alignSelf: 'center' }}>
                    <Text style={[type.label, { color: theme.accentDeep }]}>Load more comments</Text>
                  </Pressable>
                )}
              </View>
            )}

            {replyingTo && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.lg }}>
                <Text style={[type.caption, { color: theme.inkMuted, flex: 1 }]}>
                  Replying to {replyingTo.authorName}
                </Text>
                <Pressable onPress={() => setReplyingTo(null)} hitSlop={8} accessibilityRole="button">
                  <Text style={[type.caption, { color: theme.accentDeep }]}>Cancel</Text>
                </Pressable>
              </View>
            )}
            <View style={[styles.commentInputRow, { borderColor: theme.rule, marginTop: replyingTo ? space.sm : space.lg }]}>
              <TextInput
                value={commentDraft}
                onChangeText={setCommentDraft}
                placeholder={authUser ? 'Add a comment...' : 'Log in to comment'}
                placeholderTextColor={theme.inkFaint}
                editable={!!authUser && !postingComment}
                style={[type.bodyUI, { flex: 1, color: theme.ink }]}
                multiline
                onSubmitEditing={submitComment}
              />
              <Pressable
                onPress={submitComment}
                disabled={!authUser || postingComment}
                accessibilityRole="button"
                accessibilityLabel="Post comment"
              >
                <Feather name="send" size={20} color={authUser ? theme.accent : theme.inkFaint} />
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
  progressTrack: { height: 2, width: '100%' },
  progressFill: { height: 2 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  commentAction: { flexDirection: 'row', alignItems: 'center' },
  featuredImage: { height: 280, borderRadius: radius.card, marginTop: space.lg, overflow: 'hidden' },
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
