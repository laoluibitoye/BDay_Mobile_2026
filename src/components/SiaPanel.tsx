import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Modal, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/types';
import { space, type, useTheme } from '../theme';
import { useAppState } from '../state/AppState';
import { useSiaChat } from '../hooks/useSiaChat';
import { isSiaConfigured } from '../lib/api/sia';
import { getArticleById, resolveArticleIdFromUrl } from '../lib/api/content';
import { openWebSubscribe } from '../lib/webCheckout';
import { SiaChat } from './sia/SiaChat';
import { SiaLocked, type SiaLockReason } from './sia/SiaLocked';

const FAB_SIZE = 52;

type Props = {
  articleId: string;
  articleHeadline: string;
  // The story's canonical permalink (Article.sourceUrl), so Sia can fetch that exact article.
  articleUrl?: string;
};

// design.md §6 "Sia chat panel" — a floating button (lower-right, above the tab bar) that slides up a bottom
// sheet with the chat. Sia is a subscriber perk: everyone sees the button (so readers know Sia exists), but a
// guest or non-subscriber gets the "unlock Sia" screen in place of the chat. Who is entitled is decided by
// Sia's server on every request — the checks here only choose which screen to show.
//
// Renders nothing unless EXPO_PUBLIC_SIA_BASE_URL is set, so a build made without it has no Sia button rather
// than one that cannot work.
export function SiaPanel(props: Props) {
  if (!isSiaConfigured) return null;
  return <SiaPanelInner {...props} />;
}

function SiaPanelInner({ articleId, articleHeadline, articleUrl }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { authUser, isSubscribed, refreshSession, accessibilityPrefs } = useAppState();
  const { engine, state } = useSiaChat({ articleId, articleUrl: articleUrl ?? null });

  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lockedHint, setLockedHint] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  // Which screen the reader gets. A guest or a reader the app knows isn't subscribed is sent to "unlock Sia"
  // without spending a request; the server's own 401/403 (state.lock) covers the cases the app can't know.
  const lock: SiaLockReason | null = !authUser ? 'guest' : state.lock ? state.lock : !isSubscribed ? 'nonsub' : null;

  // Navigation away from the panel (login, a story) has to wait until the sheet has finished dismissing:
  // pushing a screen while an iOS Modal is still leaving can be silently dropped.
  const afterClose = useRef<(() => void) | null>(null);
  const runAfterClose = useCallback(() => {
    const fn = afterClose.current;
    afterClose.current = null;
    fn?.();
  }, []);
  const closeThen = useCallback(
    (fn: () => void) => {
      afterClose.current = fn;
      setOpen(false);
      // Modal.onDismiss is iOS-only; elsewhere a short delay stands in for it.
      if (Platform.OS !== 'ios') setTimeout(runAfterClose, 250);
    },
    [runAfterClose],
  );

  const openArticle = useCallback(
    async (url: string) => {
      if (opening) return;
      setOpening(true);
      try {
        const id = await resolveArticleIdFromUrl(url);
        const article = id ? await getArticleById(id) : null;
        if (article) {
          closeThen(() => navigation.push('ArticleReader', { articleId: article.id }));
          return;
        }
      } catch {
        // fall through to the browser
      } finally {
        setOpening(false);
      }
      // Couldn't resolve it to a story we can show in-app (a moved or unknown link): open it on the web.
      Linking.openURL(url).catch(() => undefined);
    },
    [closeThen, navigation, opening],
  );

  const openLink = useCallback((url: string) => {
    Linking.openURL(url).catch(() => undefined);
  }, []);

  const onSubscribe = useCallback(() => {
    // Same split as the paywall: a guest creates an account first, then buys on the website (the app never
    // takes payment — see lib/webCheckout.ts); a signed-in reader goes straight to the website.
    if (!authUser) closeThen(() => navigation.navigate('Auth', { mode: 'signup' }));
    else openWebSubscribe();
  }, [authUser, closeThen, navigation]);

  const onLogin = useCallback(() => closeThen(() => navigation.navigate('Auth', { mode: 'login' })), [closeThen, navigation]);

  const onRecheck = useCallback(async () => {
    setChecking(true);
    setLockedHint(null);
    try {
      await refreshSession();
      engine?.clearLock();
      // If the subscription is now active, `lock` becomes null and the chat replaces this screen, so this
      // hint is only ever seen by a reader who still isn't subscribed.
      setLockedHint("We can't see an active subscription on this account yet. It can take a minute after checkout — try again shortly.");
    } finally {
      setChecking(false);
    }
  }, [engine, refreshSession]);

  const sheetHeight = Math.min(Math.round(windowHeight * 0.82), 760);

  return (
    <>
      <Pressable
        onPress={() => {
          setLockedHint(null);
          setOpen(true);
        }}
        style={[styles.fab, { bottom: insets.bottom + 96, backgroundColor: theme.accent, shadowColor: theme.ink }]}
        accessibilityRole="button"
        accessibilityLabel="Ask Sia about this article"
      >
        <Text style={[type.label, { color: '#FFFFFF', fontSize: 18 }]}>S</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType={accessibilityPrefs.reduceMotion ? 'none' : 'slide'}
        onRequestClose={() => setOpen(false)}
        onDismiss={runAfterClose}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close Sia"
          />
          {/* Lets the sheet ride up above the keyboard; the backdrop above still receives taps outside it. */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.avoider, { pointerEvents: 'box-none' }]}>
            <View
              accessibilityViewIsModal
              style={[styles.sheet, { height: sheetHeight, backgroundColor: theme.bg, borderColor: theme.rule }]}
            >
              <View style={[styles.grabber, { backgroundColor: theme.rule }]} />

              <View style={[styles.header, { borderBottomColor: theme.rule }]}>
                <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                  <Text style={[type.label, { color: '#fff' }]}>S</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text accessibilityRole="header" style={[type.label, { color: theme.ink }]}>
                    Sia
                  </Text>
                  <Text style={[type.caption, { color: theme.inkFaint }]}>BusinessDay Intelligence Assistant</Text>
                </View>
                <Pressable
                  onPress={() => setOpen(false)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Close Sia"
                  style={styles.close}
                >
                  <Feather name="x" size={20} color={theme.inkMuted} />
                </Pressable>
              </View>

              {lock ? (
                <SiaLocked
                  reason={lock}
                  checking={checking}
                  hint={lockedHint}
                  onSubscribe={onSubscribe}
                  onLogin={onLogin}
                  onRecheck={onRecheck}
                  bottomInset={insets.bottom}
                />
              ) : (
                <SiaChat
                  engine={engine}
                  state={state}
                  articleHeadline={articleHeadline}
                  onOpenArticle={openArticle}
                  onOpenLink={openLink}
                  bottomInset={insets.bottom}
                />
              )}

              {opening && (
                <View style={[styles.opening, { backgroundColor: theme.accentTint, pointerEvents: 'none' }]}>
                  <Text style={[type.caption, { color: theme.ink }]}>Opening story…</Text>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: space.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(17,17,17,0.4)' },
  avoider: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '100%',
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: space.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  opening: { position: 'absolute', left: 0, right: 0, top: 0, paddingVertical: space.sm, alignItems: 'center' },
});
