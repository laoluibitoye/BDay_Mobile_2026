import { wpPublicGet } from './wpClient';

export type ChannelShort = {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
};

export type ChannelShortsResponse = {
  items: ChannelShort[];
};

// The Shorts tab's clips, straight from the @BDTV-NG YouTube channel's own Shorts shelf, newest
// first — via businessday-app-connector's /channel-shorts route (see class-bd-channel-shorts-api.php
// for how it's sourced). Distinct from getVideos()/VideoItem, which is the editorial WordPress
// `video` post format used for the regular longform Videos tab.
export function getChannelShorts(): Promise<ChannelShortsResponse> {
  return wpPublicGet<ChannelShortsResponse>('/wp-json/businessday-app/v1/channel-shorts');
}
