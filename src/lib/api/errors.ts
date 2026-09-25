import { WpApiError } from './wpClient';
import { ApiError } from './client';

// A WpApiError/ApiError means the request reached the server and got a real (if unwelcome) HTTP
// response — a server-side problem, not the reader's own connection. Anything else (fetch()
// itself rejecting before any response exists — React Native's "Network request failed"
// TypeError, a DNS failure, no signal at all) means the request never reached the server, which
// in practice means the device has no usable connection right now. No new native dependency
// (e.g. NetInfo) needed — this is inferred purely from which kind of error a failed request
// actually threw.
export function isConnectivityError(error: unknown): boolean {
  return !(error instanceof WpApiError) && !(error instanceof ApiError);
}

export const CONNECTIVITY_ERROR_COPY = {
  title: 'Check your internet connection',
  message: "You're offline right now — reconnect and try again.",
} as const;
