import { apiRequest } from './client';

// Default e-paper publication slug — matches the one the WordPress connector pushes for the
// main daily edition (editions.service.spec.ts's own fixture data uses the same value).
export const DEFAULT_PUBLICATION = 'e-paper';

export function getArchiveWindow(): Promise<{ archiveAccessDays: number }> {
  return apiRequest('/api/v1/me/archive-window');
}

// date must be an ISO date string (YYYY-MM-DD) — parsed server-side via `new Date(date)`.
export function getEditionDownloadUrl(
  date: string,
  publication: string = DEFAULT_PUBLICATION
): Promise<{ url: string; expiresInSeconds: number }> {
  return apiRequest(`/api/v1/me/editions/${encodeURIComponent(publication)}/${date}/download-url`);
}
