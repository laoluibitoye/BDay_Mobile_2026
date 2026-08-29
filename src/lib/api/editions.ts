import { apiRequest } from './client';
import { wpPublicGet } from './wpClient';

// Default e-paper publication slug — matches the one the WordPress connector pushes for the
// main daily edition (editions.service.spec.ts's own fixture data uses the same value).
export const DEFAULT_PUBLICATION = 'e-paper';

export function getArchiveWindow(): Promise<{ archiveAccessDays: number }> {
  return apiRequest('/api/v1/me/archive-window');
}

// Every publication with at least one edition on file (the theme's `edition_publication`
// taxonomy — E-Paper, She Means Business, Real Estate Digest, Weekender by default, but not a
// fixed list; a new WP term shows up here the first time an edition is actually published under
// it, no app change needed).
export function getEditionPublications(): Promise<string[]> {
  return apiRequest('/api/v1/me/editions/publications');
}

export type EditionListing = { date: string; locked: boolean };

// Every edition on file for one publication, newest first, each flagged with whether the
// caller's current plan can actually open it — `locked` rows still render (so a reader can see
// what they'd get by upgrading), they just route to the paywall instead of a download.
export function getEditionsForPublication(publication: string): Promise<EditionListing[]> {
  return apiRequest(`/api/v1/me/editions/${encodeURIComponent(publication)}`);
}

export type EditionHomepageCard = {
  publicationSlug: string;
  publicationLabel: string;
  date: string;
  coverImageUrl: string | null;
};

// Mirrors the theme's own "E-Editions" homepage section exactly (one card per publication
// taxonomy term, each showing its single most recent edition) — see the connector plugin's
// class-bd-editions-homepage-api.php. Public/cached, no auth — same as every other homepage
// content row; only the actual PDF download is subscription-gated.
export function getEditionsHomepage(): Promise<{ items: EditionHomepageCard[] }> {
  return wpPublicGet('/wp-json/businessday-app/v1/editions/homepage');
}

// date must be an ISO date string (YYYY-MM-DD) — parsed server-side via `new Date(date)`.
export function getEditionDownloadUrl(
  date: string,
  publication: string = DEFAULT_PUBLICATION
): Promise<{ url: string; expiresInSeconds: number }> {
  return apiRequest(`/api/v1/me/editions/${encodeURIComponent(publication)}/${date}/download-url`);
}
