// The chat state machine behind the Sia panel: messages, streaming, follow-ups, the client-side throttle,
// what to do when the server refuses (401 / 403 / 429), timeouts, and saving the conversation. It is plain
// TypeScript with every dependency injected — no React, no React Native, no network — so the whole flow can
// be driven and asserted under Node with fakes; hooks/useSiaChat.ts is the thin React wrapper around it.
//
// It deliberately mirrors the website widget (assets/js/sia-script.js) so a reader gets the same behaviour
// on both: the same throttle numbers, the same treatment of each error, the same follow-up handling.

import { cleanText, parseFollowups, splitStream } from './parseStream';
import type { ConversationStore, StoredMessage } from './history';
import { SiaAbortError, SiaHttpError, SiaTimeoutError, type AskArgs } from './client';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  status: 'done' | 'streaming' | 'error' | 'interrupted';
  // Set on an error reply: the question that failed, so "Try again" can resend it.
  retry?: string;
};

// The server turned this reader away: 'nonsub' = signed in but not (or no longer) subscribed,
// 'expired' = the session couldn't be renewed. (A guest is known without asking the server.)
export type ChatLock = 'nonsub' | 'expired' | null;

export type ChatState = {
  messages: ChatMessage[];
  followups: string[];
  busy: boolean;
  awaitingFirstText: boolean; // request sent, nothing on screen yet -> show the typing indicator
  notice: string | null; // short hint above the input (e.g. "asking quickly")
  lock: ChatLock;
  draft: string;
  ready: boolean; // the saved conversation (if any) has been loaded
};

export type EngineConfig = {
  userId: string | null; // null = signed out: nothing is loaded or saved
  articleKey: string; // article id, or 'general'
  articleUrl: string | null;
  isSubscribed: () => boolean; // what the app currently believes (from /me)
  refreshSession: () => Promise<void>; // re-reads /me
  deps: {
    askSia: (args: AskArgs) => Promise<string>;
    store: ConversationStore;
    now: () => number;
    randomId: () => string;
    isConnectivityError: (error: unknown) => boolean;
    connectivityMessage: string;
    setTimer?: (fn: () => void, ms: number) => unknown;
    clearTimer?: (handle: unknown) => void;
  };
};

// Same guard rails as the website widget. UX only — the server enforces the real per-subscriber limits.
export const MIN_SEND_INTERVAL_MS = 2000;
export const MAX_SENDS_PER_MINUTE = 6;
export const MAX_QUERY_CHARS = 500;
const RENDER_INTERVAL_MS = 60; // how often streamed text is pushed to the screen
const NOTICE_MS = 3500;

export const COPY = {
  throttled: "You're asking quickly — give Sia a few seconds.",
  rateLimited: "Sia's getting a lot of questions from you right now — please wait a moment and try again.",
  timeout: 'Sia took too long to respond. Please try again.',
  generic: 'Sia is having trouble right now. Please try again in a moment.',
  empty: "I couldn't put together an answer just now. Please try again in a moment.",
} as const;

const INITIAL_STATE: ChatState = {
  messages: [],
  followups: [],
  busy: false,
  awaitingFirstText: false,
  notice: null,
  lock: null,
  draft: '',
  ready: false,
};

export class SiaChatEngine {
  private state: ChatState = INITIAL_STATE;
  private listeners = new Set<() => void>();
  private sessionId: string;
  private controller: AbortController | null = null;
  private sendTimes: number[] = [];
  private renderTimer: unknown = null;
  private noticeTimer: unknown = null;
  private pendingText: { id: string; text: string } | null = null;
  private initPromise: Promise<void> | null = null;
  private destroyed = false;

  constructor(private readonly cfg: EngineConfig) {
    this.sessionId = this.newSessionId();
  }

  // ---- subscription (useSyncExternalStore-compatible) ----

  getState = (): ChatState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private update(patch: Partial<ChatState>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  // ---- lifecycle ----

  init(): Promise<void> {
    if (!this.initPromise) this.initPromise = this.load();
    return this.initPromise;
  }

  private async load(): Promise<void> {
    const { userId, articleKey, deps } = this.cfg;
    if (!userId) {
      this.update({ ready: true });
      return;
    }
    const stored = await deps.store.load(userId, articleKey);
    if (this.destroyed) return;
    if (stored) {
      this.sessionId = stored.sessionId;
      this.update({
        messages: stored.messages.map((m) => ({ id: deps.randomId(), role: m.role, text: m.text, status: 'done' as const })),
        ready: true,
      });
    } else {
      this.update({ ready: true });
    }
    void deps.store.prune();
  }

  destroy(): void {
    this.destroyed = true;
    this.controller?.abort();
    this.clearRenderTimer();
    this.clearNoticeTimer();
    this.listeners.clear();
  }

  // ---- input ----

  setDraft(text: string): void {
    this.update({ draft: text });
  }

  dismissNotice(): void {
    this.clearNoticeTimer();
    if (this.state.notice) this.update({ notice: null });
  }

  clearLock(): void {
    if (this.state.lock) this.update({ lock: null });
  }

  // ---- sending ----

  async send(input?: string): Promise<void> {
    await this.init();
    if (this.destroyed || this.state.busy) return;

    const text = (input ?? this.state.draft).trim().slice(0, MAX_QUERY_CHARS);
    if (!text) return;

    if (this.throttled()) {
      this.showNotice(COPY.throttled);
      return; // what they typed stays in the input
    }
    this.sendTimes.push(this.cfg.deps.now());

    const userMessage: ChatMessage = { id: this.cfg.deps.randomId(), role: 'user', text, status: 'done' };
    const replyId = this.cfg.deps.randomId();
    const reply: ChatMessage = { id: replyId, role: 'assistant', text: '', status: 'streaming' };
    this.clearNoticeTimer();
    this.update({
      messages: [...this.state.messages, userMessage, reply],
      followups: [],
      draft: '',
      busy: true,
      awaitingFirstText: true,
      notice: null,
      lock: null,
    });

    const controller = new AbortController();
    this.controller = controller;
    let latest = '';

    try {
      const finalText = await this.cfg.deps.askSia({
        query: text,
        sessionId: this.sessionId,
        articleUrl: this.cfg.articleUrl,
        signal: controller.signal,
        retryOnForbidden: this.cfg.isSubscribed(),
        onText: (accumulated) => {
          latest = accumulated;
          this.queueRender(replyId, accumulated);
        },
      });
      latest = finalText;
      this.finishAnswer(replyId, finalText);
    } catch (error) {
      this.handleFailure(error, { userMessageId: userMessage.id, replyId, question: text, partial: latest });
    } finally {
      this.controller = null;
      this.clearRenderTimer();
      if (!this.destroyed) this.update({ busy: false, awaitingFirstText: false });
    }
  }

  stop(): void {
    this.controller?.abort();
  }

  // "Try again" on an error reply: drop the failed exchange and ask the same question again.
  retry(replyId: string): Promise<void> {
    const index = this.state.messages.findIndex((m) => m.id === replyId);
    const failed = index >= 0 ? this.state.messages[index] : undefined;
    if (!failed || !failed.retry || this.state.busy) return Promise.resolve();
    const question = failed.retry;
    // Remove the error reply and the question that preceded it; send() re-adds the question.
    const before = this.state.messages[index - 1];
    const keep = this.state.messages.filter((m, i) => i !== index && !(before && before.role === 'user' && i === index - 1));
    this.update({ messages: keep });
    return this.send(question);
  }

  newConversation(): void {
    this.controller?.abort();
    this.clearRenderTimer();
    this.sessionId = this.newSessionId();
    if (this.cfg.userId) void this.cfg.deps.store.clear(this.cfg.userId, this.cfg.articleKey);
    this.update({ messages: [], followups: [], notice: null, lock: null, awaitingFirstText: false });
  }

  // ---- internals ----

  private newSessionId(): string {
    return `sia_session_${this.cfg.deps.randomId()}_${this.cfg.deps.now()}`;
  }

  private throttled(): boolean {
    const now = this.cfg.deps.now();
    this.sendTimes = this.sendTimes.filter((t) => now - t < 60_000);
    const last = this.sendTimes[this.sendTimes.length - 1];
    return (last !== undefined && now - last < MIN_SEND_INTERVAL_MS) || this.sendTimes.length >= MAX_SENDS_PER_MINUTE;
  }

  private showNotice(message: string): void {
    this.clearNoticeTimer();
    this.update({ notice: message });
    this.noticeTimer = this.setTimer(() => {
      this.noticeTimer = null;
      if (!this.destroyed) this.update({ notice: null });
    }, NOTICE_MS);
  }

  private setTimer(fn: () => void, ms: number): unknown {
    return (this.cfg.deps.setTimer ?? ((f, m) => setTimeout(f, m)))(fn, ms);
  }

  private clearTimer(handle: unknown): void {
    (this.cfg.deps.clearTimer ?? ((h) => clearTimeout(h as ReturnType<typeof setTimeout>)))(handle);
  }

  private clearNoticeTimer(): void {
    if (this.noticeTimer !== null) {
      this.clearTimer(this.noticeTimer);
      this.noticeTimer = null;
    }
  }

  private clearRenderTimer(): void {
    if (this.renderTimer !== null) {
      this.clearTimer(this.renderTimer);
      this.renderTimer = null;
    }
    this.pendingText = null;
  }

  // Streamed text arrives in bursts; painting every one would make React Native re-lay-out the whole
  // reply many times a second. The first piece is shown at once (it ends the "thinking" state), the rest
  // are coalesced to at most one paint every RENDER_INTERVAL_MS.
  private queueRender(id: string, accumulated: string): void {
    this.pendingText = { id, text: accumulated };
    if (this.state.awaitingFirstText) {
      this.paintPending();
      return;
    }
    if (this.renderTimer === null) {
      this.renderTimer = this.setTimer(() => {
        this.renderTimer = null;
        this.paintPending();
      }, RENDER_INTERVAL_MS);
    }
  }

  private paintPending(): void {
    const pending = this.pendingText;
    this.pendingText = null;
    if (!pending || this.destroyed) return;
    const visible = cleanText(splitStream(pending.text, true).visible);
    if (!visible) return; // only a held-back tag prefix so far — keep the "thinking" state
    this.setReply(pending.id, { text: visible, status: 'streaming' }, { awaitingFirstText: false });
  }

  private setReply(id: string, patch: Partial<ChatMessage>, statePatch: Partial<ChatState> = {}): void {
    this.update({ messages: this.state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)), ...statePatch });
  }

  private finishAnswer(replyId: string, raw: string): void {
    const parts = splitStream(raw, false);
    const answer = cleanText(parts.visible).trim();
    if (!answer) {
      this.setReply(replyId, { text: COPY.empty, status: 'error', retry: this.lastQuestion() }, { followups: [] });
      return;
    }
    this.setReply(replyId, { text: answer, status: 'done' }, { followups: parseFollowups(parts.followups) });
    void this.persist();
  }

  private lastQuestion(): string | undefined {
    for (let i = this.state.messages.length - 1; i >= 0; i--) {
      if (this.state.messages[i].role === 'user') return this.state.messages[i].text;
    }
    return undefined;
  }

  private handleFailure(
    error: unknown,
    ctx: { userMessageId: string; replyId: string; question: string; partial: string },
  ): void {
    if (this.destroyed) return;
    const partial = cleanText(splitStream(ctx.partial, false).visible).trim();

    // Stopped by the reader (or the panel closed): keep what arrived, without pretending it's complete.
    // Matched by name as well as class, so a cancellation is never mistaken for a failure just because it
    // reached here as a plain AbortError from the platform's fetch rather than through the Sia client.
    if (error instanceof SiaAbortError || (error as { name?: unknown } | null)?.name === 'AbortError') {
      if (partial) this.setReply(ctx.replyId, { text: partial, status: 'interrupted' });
      else this.update({ messages: this.state.messages.filter((m) => m.id !== ctx.replyId) });
      return;
    }

    // The server turned this reader away. Undo the exchange, give them their question back, and let the
    // panel show the right "unlock Sia" screen instead of a chat that can't work.
    if (error instanceof SiaHttpError && (error.status === 401 || error.status === 403)) {
      this.update({
        messages: this.state.messages.filter((m) => m.id !== ctx.userMessageId && m.id !== ctx.replyId),
        draft: ctx.question,
        lock: error.status === 403 ? 'nonsub' : 'expired',
      });
      // A 403 for someone the app thought was subscribed means the app's copy may be stale (lapsed
      // subscription) — re-read /me so the rest of the app agrees with the server.
      if (error.status === 403) this.cfg.refreshSession().catch(() => undefined);
      return;
    }

    let text: string = COPY.generic;
    if (error instanceof SiaHttpError && error.status === 429) text = error.detail ?? COPY.rateLimited;
    else if (error instanceof SiaTimeoutError) text = COPY.timeout;
    else if (!(error instanceof SiaHttpError) && this.cfg.deps.isConnectivityError(error)) text = this.cfg.deps.connectivityMessage;

    if (partial) {
      // Some answer already reached the screen — keep it, flagged as cut short, rather than replacing it.
      this.setReply(ctx.replyId, { text: partial, status: 'interrupted', retry: ctx.question });
    } else {
      this.setReply(ctx.replyId, { text, status: 'error', retry: ctx.question });
    }
  }

  private async persist(): Promise<void> {
    const { userId, articleKey, deps } = this.cfg;
    if (!userId) return;
    // Only complete question/answer pairs are saved. A question whose answer failed or was cut short would
    // otherwise come back as a lone question the next time the panel opens.
    const all = this.state.messages;
    const messages: StoredMessage[] = [];
    all.forEach((m, i) => {
      const next = all[i + 1];
      if (m.role === 'user') {
        if (next && next.role === 'assistant' && next.status === 'done' && next.text) messages.push({ role: 'user', text: m.text });
      } else if (m.status === 'done' && m.text) {
        messages.push({ role: 'assistant', text: m.text });
      }
    });
    await deps.store.save(userId, articleKey, { sessionId: this.sessionId, messages });
  }
}
