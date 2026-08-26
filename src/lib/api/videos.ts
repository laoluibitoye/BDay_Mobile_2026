import { wpPublicGet } from './wpClient';

export type VideoItem = {
  id: number;
  title: string;
  youtubeId: string;
  section: string;
  imageUrl: string | null;
  publishedAt: string;
  link: string;
};

export type VideosResponse = {
  items: VideoItem[];
};

// Real posts using the theme's `video` post format with a YouTube ID set — same clips the
// website's video templates embed, via businessday-app-connector's /videos route.
export function getVideos(): Promise<VideosResponse> {
  return wpPublicGet<VideosResponse>('/wp-json/businessday-app/v1/videos');
}
