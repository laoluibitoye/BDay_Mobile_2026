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

export function useUnreadCommentNotificationCount(): number {
  const rows = useCommentNotifications();
  return rows?.filter((r) => !r.read).length ?? 0;
}
