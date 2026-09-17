import { useEffect, useState } from 'react';
import { getCommentNotifications, type CommentNotificationView } from '../lib/api/comments';

let cached: CommentNotificationView[] | null = null;
let inFlight: Promise<CommentNotificationView[]> | null = null;

function fetchNotifications(): Promise<CommentNotificationView[]> {
  if (inFlight) return inFlight;
  inFlight = getCommentNotifications()
    .then((rows) => {
      cached = rows;
      return rows;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export function invalidateCommentNotificationsCache(): void {
  cached = null;
}

export function useCommentNotifications(): CommentNotificationView[] | null {
  const [rows, setRows] = useState<CommentNotificationView[] | null>(cached);

  useEffect(() => {
    fetchNotifications()
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return rows;
}

// Bug found live: a failed fetch collapsed into the same empty array a genuinely-empty inbox
// returns, so CommentNotificationsScreen showed "No replies yet" on a real network failure with
// no way to retry. Exposes `failed` separately (useUnreadCommentNotificationCount below keeps
// using the plain array, unaffected).
export function useCommentNotificationsState(): { rows: CommentNotificationView[] | null; failed: boolean; retry: () => void } {
  const [rows, setRows] = useState<CommentNotificationView[] | null>(cached);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setFailed(false);
    fetchNotifications()
      .then(setRows)
      .catch(() => setFailed(true));
  }, [attempt]);

  return { rows, failed, retry: () => setAttempt((a) => a + 1) };
}

export function useUnreadCommentNotificationCount(): number {
  const rows = useCommentNotifications();
  return rows?.filter((r) => !r.read).length ?? 0;
}
