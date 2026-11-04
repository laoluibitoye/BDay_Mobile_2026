import { wpPublicGet } from './wpClient';
import { registerArticles, type FeedItem } from './content';
import type { Article } from '../../data/types';

export type YourNewsDesk = { label: string; url: string; items: Article[] };
type YourNewsDeskResponse = { label: string; url: string; items: FeedItem[] };
type YourNewsResponse = { desks: YourNewsDeskResponse[] };

// Mirrors the theme's admin-editable "Your News" desks (wp-admin -> BDay Aero Options -> News
// Carousel) exactly — same desks, same order, same posts, however many are configured (no
// hardcoded count on either side). See core/homepage/redesign-data.php's
// bday_get_redesign_your_news_desks() on the theme and class-bd-your-news-api.php on the
// connector plugin.
export async function getYourNews(): Promise<YourNewsDesk[]> {
  const res = await wpPublicGet<YourNewsResponse>('/wp-json/businessday-app/v1/your-news');
  return res.desks.map((desk) => ({ label: desk.label, url: desk.url, items: registerArticles(desk.items) }));
}
