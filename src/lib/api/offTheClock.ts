import { wpPublicGet } from './wpClient';

export type OffTheClockItem = { id: number; headline: string; imageUrl: string | null; link: string };
export type OffTheClockTab = { label: string; categorySlug: string; items: OffTheClockItem[] };

// Mirrors the theme's admin-editable "Off the Clock" category list (Appearance -> BusinessDay
// Theme -> Off the Clock) exactly — same tabs, same order, same posts — via the connector
// plugin's own read of that option. No separate mobile-only curation step.
export function getOffTheClock(): Promise<{ tabs: OffTheClockTab[] }> {
  return wpPublicGet('/wp-json/businessday-app/v1/off-the-clock');
}
