import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { newsletters } from '../data/mock';
import { LanguageCode } from '../data/languages';
import { clearTokens, getAccessToken } from '../lib/api/client';
import { getMe } from '../lib/api/auth';
import type { MeResponse } from '../lib/api/types';
import { addBookmark, getBookmarks, removeBookmark } from '../lib/api/bookmarks';
import { invalidateBookmarksCache } from '../hooks/useBookmarks';
import { getReadingHistory, recordReadingHistoryView } from '../lib/api/readingHistory';
import { invalidateReadingHistoryCache } from '../hooks/useReadingHistory';
import { follow as followRequest, getFollows, unfollow as unfollowRequest } from '../lib/api/follows';
import type { Article } from '../data/types';

export type AccessibilityPrefs = {
  largeTouchTargets: boolean;
  reduceMotion: boolean;
  boldText: boolean;
  screenReaderHints: boolean;
};

export type DataOfflinePrefs = {
  wifiOnly: boolean;
  autoDownloadSaved: boolean;
  preloadImages: boolean;
};

export type Edition = 'nigeria' | 'africa' | 'global';

export type ProfileInfo = {
  name: string;
  email: string;
  role: string;
};

export type TaxonomyUsage = Record<string, { count: number; lastUsedAt: number }>;

type AppStateValue = {
  // Real session from AeroPaywall auth (IMPLEMENTATION_PLAN.md §16.3 Step 1/2). `isSubscribed` is
  // derived from `authUser.subscription?.status`, never stored separately — the server is the
  // only source of truth for subscription state, per §17. There is no client-computed
  // free-article counter anymore: per-article gating comes from the real `stage` in
  // ArticleEntitlement.
  authUser: MeResponse | null;
  setAuthUser: (u: MeResponse | null) => void;
  refreshSession: () => Promise<void>;
  logout: () => void;
  isSubscribed: boolean;
  savedArticleIds: string[];
  toggleSaved: (article: Article) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  readingHistoryIds: string[];
  recordView: (article: Article) => void;
  clearHistory: () => void;
  watchlistSymbols: string[];
  toggleWatchlist: (symbol: string) => void;
  downloadedArticleIds: string[];
  toggleDownload: (id: string) => void;
  clearDownloads: () => void;
  accessibilityPrefs: AccessibilityPrefs;
  setAccessibilityPref: (key: keyof AccessibilityPrefs, value: boolean) => void;
  dataOfflinePrefs: DataOfflinePrefs;
  setDataOfflinePref: (key: keyof DataOfflinePrefs, value: boolean) => void;
  edition: Edition;
  setEdition: (e: Edition) => void;
  followedTopics: string[];
  toggleFollowedTopic: (topic: string) => void;
  subscribedNewsletterIds: string[];
  toggleNewsletterSubscription: (id: string) => void;
  readNotificationIds: string[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;
  biometricReEntry: boolean;
  setBiometricReEntry: (v: boolean) => void;
  profile: ProfileInfo;
  setProfile: (p: ProfileInfo) => void;
  taxonomyUsage: TaxonomyUsage;
  recordTaxonomyUse: (name: string) => void;
};

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPrefs = {
  largeTouchTargets: false,
  reduceMotion: false,
  boldText: false,
  screenReaderHints: true,
};

const DEFAULT_DATA_OFFLINE_PREFS: DataOfflinePrefs = {
  wifiOnly: true,
  autoDownloadSaved: false,
  preloadImages: true,
};

const DEFAULT_PROFILE: ProfileInfo = {
  name: 'Ada Okafor',
  email: 'ada.okafor@example.com',
  role: 'Investor',
};

// Phase 1 prototype: local-only mock state. Every touchpoint here is a stand-in
// for the real Entitlement Service / Saved-articles API — see IMPLEMENTATION_PLAN.md §13 Phase 3.
// `language` similarly stands in for a real i18n/translation pipeline — see LanguageScreen.
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<MeResponse | null>(null);
  const isSubscribed = authUser?.subscription?.status === 'active';
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [readingHistoryIds, setReadingHistoryIds] = useState<string[]>([]);

  // Bookmarks/reading history are server-backed once signed in — seeded here (not lazily inside
  // ForYouScreen) so isSaved checks on ArticleCard/HeroArticleCard/ArticleReaderScreen are
  // correct app-wide, not just on the Saved tab itself.
  const syncServerBackedLists = useCallback(async () => {
    const [bookmarks, history, follows] = await Promise.all([
      getBookmarks().catch(() => []),
      getReadingHistory().catch(() => []),
      getFollows().catch(() => []),
    ]);
    setSavedArticleIds(bookmarks.map((b) => b.postId));
    setReadingHistoryIds(history.map((h) => h.postId));
    setFollowedTopics(follows.filter((f) => f.taxonomy === 'category').map((f) => f.termId));
  }, []);

  const refreshSession = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setAuthUser(null);
      setSavedArticleIds([]);
      setReadingHistoryIds([]);
      setFollowedTopics([]);
      return;
    }
    try {
      setAuthUser(await getMe());
      void syncServerBackedLists();
    } catch {
      // leave the last-known session in place on a transient failure
    }
  }, [syncServerBackedLists]);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['NGX', 'USDNGN']);
  const [downloadedArticleIds, setDownloadedArticleIds] = useState<string[]>([]);
  const [accessibilityPrefs, setAccessibilityPrefs] = useState<AccessibilityPrefs>(DEFAULT_ACCESSIBILITY_PREFS);
  const [dataOfflinePrefs, setDataOfflinePrefs] = useState<DataOfflinePrefs>(DEFAULT_DATA_OFFLINE_PREFS);
  const [edition, setEdition] = useState<Edition>('nigeria');
  const [followedTopics, setFollowedTopics] = useState<string[]>(['Banking', 'Markets']);
  const [subscribedNewsletterIds, setSubscribedNewsletterIds] = useState<string[]>(newsletters.map((n) => n.id));
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [biometricReEntry, setBiometricReEntry] = useState(false);
  const [profile, setProfile] = useState<ProfileInfo>(DEFAULT_PROFILE);
  const [taxonomyUsage, setTaxonomyUsage] = useState<TaxonomyUsage>({});

  React.useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      authUser,
      setAuthUser,
      refreshSession,
      logout: () => {
        setAuthUser(null);
        void clearTokens();
      },
      isSubscribed,
      savedArticleIds,
      // Optimistic, same posture as the web SDK's bookmark-button.ts: flips immediately, then
      // fires the real request in the background. A failed request (offline, or a mock/demo
      // article with no real sourceUrl to save) just means this save won't survive a refetch —
      // never blocks or errors the tap itself.
      toggleSaved: (article: Article) => {
        const isSaved = savedArticleIds.includes(article.id);
        setSavedArticleIds((prev) => (isSaved ? prev.filter((x) => x !== article.id) : [...prev, article.id]));
        const request = isSaved
          ? removeBookmark(article.id)
          : addBookmark({ postId: article.id, title: article.headline, url: article.sourceUrl ?? '', imageUrl: article.imageUrl });
        request.then(invalidateBookmarksCache).catch(() => undefined);
      },
      language,
      setLanguage,
      readingHistoryIds,
      // Optimistic local ordering plus a fire-and-forget server write, mirroring the web SDK's
      // recordReadingHistoryView() exactly — never blocks the reading session.
      recordView: (article: Article) => {
        setReadingHistoryIds((prev) => [article.id, ...prev.filter((x) => x !== article.id)].slice(0, 50));
        if (!authUser) return;
        recordReadingHistoryView({
          postId: article.id,
          title: article.headline,
          url: article.sourceUrl ?? '',
          imageUrl: article.imageUrl,
        });
        invalidateReadingHistoryCache();
      },
      // No bulk-clear endpoint exists server-side (reading history self-prunes to 200 rows) —
      // this only clears the local id list and cached hook data, used by the Account & Security
      // screen's simulated "delete account" flow, not a real per-reader data-deletion action.
      clearHistory: () => {
        setReadingHistoryIds([]);
        invalidateReadingHistoryCache();
      },
      watchlistSymbols,
      toggleWatchlist: (symbol: string) =>
        setWatchlistSymbols((prev) => (prev.includes(symbol) ? prev.filter((x) => x !== symbol) : [...prev, symbol])),
      downloadedArticleIds,
      toggleDownload: (id: string) =>
        setDownloadedArticleIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      clearDownloads: () => setDownloadedArticleIds([]),
      accessibilityPrefs,
      setAccessibilityPref: (key: keyof AccessibilityPrefs, val: boolean) =>
        setAccessibilityPrefs((prev) => ({ ...prev, [key]: val })),
      dataOfflinePrefs,
      setDataOfflinePref: (key: keyof DataOfflinePrefs, val: boolean) =>
        setDataOfflinePrefs((prev) => ({ ...prev, [key]: val })),
      edition,
      setEdition,
      followedTopics,
      // Mock topics carry no real WP taxonomy term id — the topic label doubles as termId and
      // termLabel, same stand-in every other mock-data call site in this app uses until a real
      // taxonomy feed exists. Optimistic, same posture as toggleSaved above.
      toggleFollowedTopic: (topic: string) => {
        const isFollowed = followedTopics.includes(topic);
        setFollowedTopics((prev) => (isFollowed ? prev.filter((t) => t !== topic) : [...prev, topic]));
        const request = isFollowed
          ? unfollowRequest('category', topic)
          : followRequest({ taxonomy: 'category', termId: topic, termLabel: topic });
        request.catch(() => undefined);
      },
      subscribedNewsletterIds,
      toggleNewsletterSubscription: (id: string) =>
        setSubscribedNewsletterIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      readNotificationIds,
      markNotificationRead: (id: string) =>
        setReadNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
      markAllNotificationsRead: (ids: string[]) =>
        setReadNotificationIds((prev) => Array.from(new Set([...prev, ...ids]))),
      biometricReEntry,
      setBiometricReEntry,
      profile,
      setProfile,
      taxonomyUsage,
      recordTaxonomyUse: (name: string) =>
        setTaxonomyUsage((prev) => ({
          ...prev,
          [name]: { count: (prev[name]?.count ?? 0) + 1, lastUsedAt: Date.now() },
        })),
    }),
    [
      authUser,
      refreshSession,
      isSubscribed,
      savedArticleIds,
      language,
      readingHistoryIds,
      watchlistSymbols,
      downloadedArticleIds,
      accessibilityPrefs,
      dataOfflinePrefs,
      edition,
      followedTopics,
      subscribedNewsletterIds,
      readNotificationIds,
      biometricReEntry,
      profile,
      taxonomyUsage,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
