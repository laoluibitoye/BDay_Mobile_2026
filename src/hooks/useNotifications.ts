import { useEffect, useState } from 'react';
import { getNotifications, type NotificationItem } from '../lib/api/notifications';

let cached: NotificationItem[] | null = null;
let inFlight: Promise<NotificationItem[]> | null = null;

function fetchNotifications(): Promise<NotificationItem[]> {
  if (inFlight) return inFlight;
  inFlight = getNotifications()
    .then((rows) => {
      cached = rows;
      return rows;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export function useNotifications(): NotificationItem[] | null {
  const [rows, setRows] = useState<NotificationItem[] | null>(cached);

  useEffect(() => {
    fetchNotifications()
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return rows;
}

// Bug found live: a failed fetch collapsed into the same empty array a genuinely-empty inbox
// returns, so NotificationsScreen showed "No notifications yet" on a real network failure with
// no way to retry. This exposes `failed` separately (without changing useNotifications()'s
// existing return shape, since SettingsScreen's unread-count badge only ever needs the plain
// array) so the screen can show a real Retry state instead.
export function useNotificationsState(): { rows: NotificationItem[] | null; failed: boolean; retry: () => void } {
  const [rows, setRows] = useState<NotificationItem[] | null>(cached);
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
