import { wpPublicGet } from './wpClient';

export type VideoItem = {
  id: number;
  title: string;
  youtubeId: string;
  // Set server-side purely from URL shape — an editor marks a clip as a Short by pasting its
  // youtube.com/shorts/ link (instead of the regular watch/embed link) into the same field, no
  // separate admin field needed. See class-bd-videos-api.php's isShortsUrl().
  isShort: boolean;
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
