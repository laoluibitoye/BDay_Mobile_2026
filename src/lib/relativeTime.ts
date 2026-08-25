// Formats a real ISO timestamp (from the WP feed API) into the same relative-label convention
// mock data uses ("2h ago", "3d ago", "Just now") — `Article.publishedAt` is a display label
// everywhere in the UI, not a raw timestamp, regardless of whether the article is real or mock.
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.max(0, Math.round(diffMs / 60000));
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return `${Math.round(diffDay / 7)}w ago`;
}

// Parses mock `publishedAt` labels ("2h ago", "3d ago", "1w ago", "Just now") into minutes-ago,
// so recency-ordered feeds (Latest → Recent) can sort mock data without a real timestamp field.
export function minutesAgo(label: string): number {
  if (/^just now$/i.test(label)) return 0;
  const match = label.match(/^(\d+)\s*(m|h|d|w)\b/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const n = Number(match[1]);
  const unit = match[2].toLowerCase();
  const perUnit: Record<string, number> = { m: 1, h: 60, d: 60 * 24, w: 60 * 24 * 7 };
  return n * (perUnit[unit] ?? 1);
}
