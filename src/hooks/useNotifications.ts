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
