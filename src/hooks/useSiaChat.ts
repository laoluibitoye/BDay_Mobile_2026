import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { randomUUID } from 'expo-crypto';
import { askSia } from '../lib/api/sia';
import { CONNECTIVITY_ERROR_COPY, isConnectivityError } from '../lib/api/errors';
import { conversationStore } from '../lib/sia/conversationStore';
import { SiaChatEngine, type ChatState } from '../lib/sia/engine';
import { useAppState } from '../state/AppState';

// Before the engine exists (first render, or while switching articles) the panel just sees an idle, empty chat.
const IDLE_STATE: ChatState = {
  messages: [],
  followups: [],
  busy: false,
  awaitingFirstText: false,
  notice: null,
  lock: null,
  draft: '',
  ready: false,
};
const NO_STORE = { subscribe: () => () => undefined, getState: () => IDLE_STATE };

type Options = {
  // Which article the reader is on. Each article keeps its own thread; null = a general (non-article) chat.
  articleId: string | null;
  // The article's canonical permalink, so Sia can fetch that exact story rather than guess from search.
  articleUrl: string | null;
};

// Thin React wrapper around SiaChatEngine (lib/sia/engine.ts holds all the behaviour, and is tested on its own).
export function useSiaChat({ articleId, articleUrl }: Options): { engine: SiaChatEngine | null; state: ChatState } {
  const { authUser, isSubscribed, refreshSession } = useAppState();
  const userId = authUser?.id ?? null;

  // The engine reads these lazily, so a change in subscription state never has to rebuild it (and lose the
  // conversation on screen).
  const isSubscribedRef = useRef(isSubscribed);
  isSubscribedRef.current = isSubscribed;
  const refreshSessionRef = useRef(refreshSession);
  refreshSessionRef.current = refreshSession;

  // Created inside an effect, not useMemo: destroy() on cleanup is permanent for an engine, and React's
  // development double-mount would otherwise hand the panel an engine that has already been torn down.
  const [engine, setEngine] = useState<SiaChatEngine | null>(null);
  useEffect(() => {
    const created = new SiaChatEngine({
      userId,
      articleKey: articleId ?? 'general',
      articleUrl,
      isSubscribed: () => isSubscribedRef.current,
      refreshSession: () => refreshSessionRef.current(),
      deps: {
        askSia,
        store: conversationStore,
        now: Date.now,
        randomId: randomUUID,
        isConnectivityError,
        connectivityMessage: CONNECTIVITY_ERROR_COPY.message,
      },
    });
    setEngine(created);
    void created.init();
    return () => {
      created.destroy();
      setEngine((current) => (current === created ? null : current));
    };
  }, [userId, articleId, articleUrl]);

  const source = engine ?? NO_STORE;
  const state = useSyncExternalStore(source.subscribe, source.getState);
  return { engine, state };
}
