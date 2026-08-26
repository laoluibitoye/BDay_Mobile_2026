import { wpPublicGet } from './wpClient';

export type ToonItem = {
  id: number;
  title: string;
  imageUrl: string | null;
  publishedAt: string;
  link: string;
};

export type ToonsResponse = {
  items: ToonItem[];
};

// The real `cartoons` CPT — same source the website's "Toon of the Day" homepage row and
// archive-cartoons.php use. items[0] is today's cartoon (newest publish), the rest is the
// archive, via businessday-app-connector's /toons route.
export function getToons(): Promise<ToonsResponse> {
  return wpPublicGet<ToonsResponse>('/wp-json/businessday-app/v1/toons');
}
