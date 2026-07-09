import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { GlassSheet } from '../../components/GlassSheet';
import { PremiumBadge } from '../../components/Badge';
import { ReaderControls } from '../../components/ReaderControls';
import { SiaPanel } from '../../components/SiaPanel';
import { articles, authors, breakingArticle } from '../../data/mock';
import { LANGUAGES } from '../../data/languages';
import { useAppState } from '../../state/AppState';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticleReader'>;

export function ArticleReaderScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const [fontScale, setFontScale] = useState(0);
  const [isTranslated, setIsTranslated] = useState(false);
  const {
    isSubscribed,
    freeArticlesUsed,
    freeArticlesLimit,
    useFreeArticle,
    savedArticleIds,
    toggleSaved,
    language,
    recordView,
  } = useAppState();
  const languageLabel = LANGUAGES.find((l) => l.code === language)?.label ?? language;
  const article =
    [...articles, breakingArticle].find((a) => a.id === route.params.articleId) ?? articles[0];
  const author = authors.find((a) => a.id === article.authorId);
  const isSaved = savedArticleIds.includes(article.id);

  const isLocked = article.isPremium && !isSubscribed && freeArticlesUsed >= freeArticlesLimit;

  useEffect(() => {
    if (article.isPremium && !isSubscribed && !isLocked) useFreeArticle();
    recordView(article.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id]);

  const visibleParagraphs = isLocked ? article.body.slice(0, 1) : article.body;

  return (
    <Screen>
      <AppHeader variant="compact" showBack />
      <View style={styles.actionRow}>
        <Pressable hitSlop={8}>
          <Feather name="headphones" size={20} color={theme.inkMuted} />
        </Pressable>
        <Pressable onPress={() => toggleSaved(article.id)} hitSlop={8}>
          <Feather name="bookmark" size={20} color={isSaved ? theme.accent : theme.inkMuted} />
        </Pressable>
        <Pressable hitSlop={8}>
          <Feather name="share" size={20} color={theme.inkMuted} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('GiftArticle', { articleId: article.id })}
          hitSlop={8}
          accessibilityLabel="Gift this article"
        >
          <Feather name="gift" size={20} color={theme.inkMuted} />
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
        <Text
          style={[type.mono, { color: theme.inkFaint, marginTop: space.md }]}
          onPress={() => author && navigation.navigate('ColumnistPage', { authorId: author.id })}
        >
          BY <Text style={{ color: theme.accentDeep }}>{author?.name.toUpperCase()}</Text> · {article.publishedAt} ·{' '}
          {article.readTime}
        </Text>

        <View style={[styles.featuredImage, { backgroundColor: article.heroColor }]} />

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

        {!isLocked && <SiaPanel articleHeadline={article.headline} />}
      </View>
    </Screen>
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
});
