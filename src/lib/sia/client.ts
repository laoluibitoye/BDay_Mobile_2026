// Streaming client for Sia's `/ask` endpoint. Everything environment-specific (fetch, token storage, the
// base URL) is injected, so the request/retry/timeout/streaming rules below run — and are tested — under
// Node exactly as they do on a phone; lib/api/sia.ts wires in the real ones.
//
// The contract, shared with the website widget: GET /ask?query=…&session_id=…[&article_url=…] with the
// reader's AeroPaywall access token as `Authorization: Bearer`. The reply streams back as plain text (the
// answer, then a <followups> block). 401 = not signed in / session expired, 403 = signed in but not
// subscribed, 429 = asking too fast — all real HTTP errors with a JSON `{"detail": "..."}`, not text
// embedded in a 200 stream.

import { Utf8StreamDecoder } from './utf8';

export class SiaHttpError extends Error {
  readonly status: number;
  // The server's own words for a refusal (e.g. the rate-limit message), when it sent a short string.
  readonly detail: string | null;

  constructor(status: number, detail: string | null) {
    super(detail ?? `Sia request failed (${status})`);
    this.name = 'SiaHttpError';
    this.status = status;
    this.detail = detail;
  }
}

// The caller (or the panel closing) cancelled the request — not a failure.
export class SiaAbortError extends Error {
  constructor() {
    super('Sia request aborted');
    this.name = 'AbortError';
  }
}

// No response, or the stream stalled, for too long.
export class SiaTimeoutError extends Error {
  constructor() {
    super('Sia took too long to respond');
    this.name = 'SiaTimeoutError';
  }
}

export type AskArgs = {
  query: string;
  sessionId: string;
  // The article the reader is on; lets Sia fetch that exact story instead of guessing from search.
  articleUrl?: string | null;
  signal?: AbortSignal;
  // Called with the *whole* text received so far, each time it grows.
  onText?: (accumulated: string) => void;
  // A 403 from someone the app believes is subscribed usually means their cached token predates the
  // subscription (bought on the website, say). Renew the token and retry once before giving up on them.
  retryOnForbidden?: boolean;
};

export type SiaFetchResponse = {
  ok: boolean;
  status: number;
  body: ReadableStream<Uint8Array> | null;
  text(): Promise<string>;
};

export type SiaClientDeps = {
  baseUrl: string;
  fetch: (url: string, init: { headers: Record<string, string>; signal: AbortSignal }) => Promise<SiaFetchResponse>;
  getAccessToken: () => Promise<string | null>;
  // Renews the access token (shared, de-duplicated refresh — refresh tokens are single-use). Null on failure.
  refreshAccessToken: () => Promise<string | null>;
  firstByteTimeoutMs?: number;
  stallTimeoutMs?: number;
};

const DEFAULT_FIRST_BYTE_TIMEOUT_MS = 30_000;
const DEFAULT_STALL_TIMEOUT_MS = 25_000;

function buildUrl(baseUrl: string, args: AskArgs): string {
  const params = [`query=${encodeURIComponent(args.query)}`, `session_id=${encodeURIComponent(args.sessionId)}`];
  if (args.articleUrl) params.push(`article_url=${encodeURIComponent(args.articleUrl)}`);
  return `${baseUrl}/ask?${params.join('&')}`;
}

function parseDetail(body: string): string | null {
  try {
    const detail = (JSON.parse(body) as { detail?: unknown }).detail;
    return typeof detail === 'string' && detail.length > 0 && detail.length < 300 ? detail : null;
  } catch {
    return null;
  }
}

export function createAskSia(deps: SiaClientDeps) {
  const firstByteMs = deps.firstByteTimeoutMs ?? DEFAULT_FIRST_BYTE_TIMEOUT_MS;
  const stallMs = deps.stallTimeoutMs ?? DEFAULT_STALL_TIMEOUT_MS;

  return async function askSia(args: AskArgs): Promise<string> {
    if (args.signal?.aborted) throw new SiaAbortError();

    let token = await deps.getAccessToken();
    if (!token) throw new SiaHttpError(401, null);

    // One controller for the whole call: the caller's cancellation and our own timeouts both abort it.
    const controller = new AbortController();
    let timedOut = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const clearTimer = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
    const armTimer = (ms: number) => {
      clearTimer();
      timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, ms);
    };
    const onCallerAbort = () => controller.abort();
    args.signal?.addEventListener('abort', onCallerAbort);

    // Some fetch implementations don't reject a pending read() when aborted, so race it explicitly.
    const aborted = new Promise<never>((_, reject) => {
      controller.signal.addEventListener('abort', () => reject(new SiaAbortError()), { once: true });
    });
    aborted.catch(() => undefined); // never an unhandled rejection if nothing is racing it at that moment

    try {
      let response: SiaFetchResponse | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        armTimer(firstByteMs);
        response = await Promise.race([
          deps.fetch(buildUrl(deps.baseUrl, args), {
            headers: { Authorization: `Bearer ${token}`, Accept: 'text/plain' },
            signal: controller.signal,
          }),
          aborted,
        ]);
        clearTimer();

        const worthRenewing = response.status === 401 || (response.status === 403 && args.retryOnForbidden === true);
        if (attempt === 0 && worthRenewing) {
          await response.text().catch(() => ''); // release the connection before retrying
          const fresh = await deps.refreshAccessToken();
          if (!fresh) throw new SiaHttpError(response.status, null);
          token = fresh;
          continue;
        }
        break;
      }

      if (!response) throw new SiaHttpError(0, null);
      if (!response.ok) {
        throw new SiaHttpError(response.status, parseDetail(await response.text().catch(() => '')));
      }

      // No streaming body available (an older runtime): take the whole answer at once.
      if (!response.body) {
        const whole = await Promise.race([response.text(), aborted]);
        args.onText?.(whole);
        return whole;
      }

      const reader = response.body.getReader();
      const decoder = new Utf8StreamDecoder();
      let accumulated = '';
      try {
        for (;;) {
          armTimer(stallMs);
          const { done, value } = await Promise.race([reader.read(), aborted]);
          if (done) break;
          if (value && value.length > 0) {
            accumulated += decoder.push(value);
            args.onText?.(accumulated);
          }
        }
      } catch (error) {
        reader.cancel().catch(() => undefined);
        throw error;
      } finally {
        clearTimer();
      }

      const tail = decoder.flush();
      if (tail) {
        accumulated += tail;
        args.onText?.(accumulated);
      }
      return accumulated;
    } catch (error) {
      // Whatever the platform threw when the request was cancelled, report *why* it was cancelled.
      if (controller.signal.aborted) throw timedOut ? new SiaTimeoutError() : new SiaAbortError();
      throw error;
    } finally {
      clearTimer();
      args.signal?.removeEventListener('abort', onCallerAbort);
    }
  };
}
