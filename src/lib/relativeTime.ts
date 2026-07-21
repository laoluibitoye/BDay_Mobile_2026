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
