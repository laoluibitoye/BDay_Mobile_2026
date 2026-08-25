import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { newsletters } from '../data/mock';
import { LanguageCode } from '../data/languages';
import { clearTokens, getAccessToken } from '../lib/api/client';
import { getMe } from '../lib/api/auth';
import type { MeResponse } from '../lib/api/types';

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
  toggleSaved: (id: string) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  readingHistoryIds: string[];
  recordView: (id: string) => void;
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
  const refreshSession = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setAuthUser(null);
      return;
    }
    try {
      setAuthUser(await getMe());
    } catch {
      // leave the last-known session in place on a transient failure
    }
  }, []);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [readingHistoryIds, setReadingHistoryIds] = useState<string[]>([]);
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
      toggleSaved: (id: string) =>
        setSavedArticleIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      language,
      setLanguage,
      readingHistoryIds,
      recordView: (id: string) =>
        setReadingHistoryIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 50)),
      clearHistory: () => setReadingHistoryIds([]),
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
      toggleFollowedTopic: (topic: string) =>
        setFollowedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic])),
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
