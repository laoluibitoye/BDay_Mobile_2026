import { wpPublicGet } from './wpClient';

export type TodaysPaperSection = {
  title: string;
  items: { id: number; headline: string; dek: string; isPremium: boolean; link: string }[];
};
export type TodaysPaperResponse = { date: string; pdfUrl: string; sections: TodaysPaperSection[] };

// Manually-curated per print-edition-date content (wp-admin → BusinessDay App → Today's Paper) —
// never a live category query, see the plugin's own docblock for why.
export function getTodaysPaper(): Promise<TodaysPaperResponse> {
  return wpPublicGet<TodaysPaperResponse>('/wp-json/businessday-app/v1/todays-paper');
}
