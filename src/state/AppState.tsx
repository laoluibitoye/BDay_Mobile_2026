import React, { createContext, useContext, useMemo, useState } from 'react';
import { freeArticlesLimit } from '../data/mock';
import { LanguageCode } from '../data/languages';

type AppStateValue = {
  isSubscribed: boolean;
  setSubscribed: (v: boolean) => void;
  freeArticlesUsed: number;
  useFreeArticle: () => void;
  freeArticlesLimit: number;
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
};

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

// Phase 1 prototype: local-only mock state. Every touchpoint here is a stand-in
// for the real Entitlement Service / Saved-articles API — see IMPLEMENTATION_PLAN.md §13 Phase 3.
// `language` similarly stands in for a real i18n/translation pipeline — see LanguageScreen.
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isSubscribed, setSubscribed] = useState(false);
  const [freeArticlesUsed, setFreeArticlesUsed] = useState(freeArticlesLimit); // starts "used up" to demo the paywall
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [readingHistoryIds, setReadingHistoryIds] = useState<string[]>([]);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['NGX', 'USDNGN']);
  const [downloadedArticleIds, setDownloadedArticleIds] = useState<string[]>([]);

  const value = useMemo(
    () => ({
      isSubscribed,
      setSubscribed,
      freeArticlesUsed,
      useFreeArticle: () => setFreeArticlesUsed((n) => Math.min(n + 1, freeArticlesLimit)),
      freeArticlesLimit,
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
    }),
    [isSubscribed, freeArticlesUsed, savedArticleIds, language, readingHistoryIds, watchlistSymbols, downloadedArticleIds]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
