import { wpPublicGet } from './wpClient';

export type PodcastEpisode = {
  id: number;
  title: string;
  showName: string;
  duration: string;
  spotifyUrl: string | null;
  audioUrl: string | null;
  embedUrl: string | null;
  imageUrl: string | null;
  notes: string;
  publishedAt: string;
  link: string;
};

export type PodcastsResponse = {
  items: PodcastEpisode[];
};

// The real `podcast` CPT — same episodes the website's podcast carousel and single-episode
// pages show, via businessday-app-connector's /podcasts route.
export function getPodcasts(): Promise<PodcastsResponse> {
  return wpPublicGet<PodcastsResponse>('/wp-json/businessday-app/v1/podcasts');
}
