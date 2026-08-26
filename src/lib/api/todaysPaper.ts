import { wpPublicGet } from './wpClient';

export type TodaysPaperSection = {
  title: string;
  items: { id: number; headline: string; dek: string; isPremium: boolean; link: string }[];
};
export type TodaysPaperResponse = {
  date: string;
  publication: string;
  coverImageUrl: string | null;
  sections: TodaysPaperSection[];
};

// Reads the same real curation an editor already does once for the website (posts flagged
// "Feature in Today's Paper" + the latest e-edition cover) — see the plugin's own docblock. The
// actual PDF is fetched separately, on demand, via editions.ts's getEditionDownloadUrl(date,
// publication) — a short-lived signed URL, never a static link stored in WordPress.
export function getTodaysPaper(): Promise<TodaysPaperResponse> {
  return wpPublicGet<TodaysPaperResponse>('/wp-json/businessday-app/v1/todays-paper');
}
