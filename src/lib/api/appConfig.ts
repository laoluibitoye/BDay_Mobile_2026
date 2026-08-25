import { wpPublicGet } from './wpClient';
import type { EntitlementStage } from './types';

export type AppBanner = {
  id: string;
  placement: 'home_top' | 'home_mid' | 'explore_top' | 'article_footer' | 'latest_top';
  title: string;
  imageUrl: string;
  linkUrl: string | null;
};

export type AdSlot = {
  placement: 'home_feed' | 'article_body' | 'explore_feed';
  enabled: boolean;
  adUnitId: string;
  houseAdImageUrl: string;
  houseAdLinkUrl: string;
};

export type PaywallCopyEntry = { headline: string; body: string; buttonLabel: string };

export type AppConfig = {
  banners: AppBanner[];
  adSlots: AdSlot[];
  paywallCopy: Record<Exclude<EntitlementStage, 'open'>, PaywallCopyEntry>;
};

// Fetched from businessday-app-connector's own cached endpoint (see wordpress-plugin/), which is
// already shared-cached server-side — this module-level cache just avoids every consumer
// (banners, ad slots, paywall copy) independently re-fetching on every mount within one app
// session.
let cached: AppConfig | null = null;
let inFlight: Promise<AppConfig> | null = null;

export function getAppConfig(): Promise<AppConfig> {
  if (cached) return Promise.resolve(cached);
  if (inFlight) return inFlight;

  inFlight = wpPublicGet<AppConfig>('/wp-json/businessday-app/v1/config')
    .then((config) => {
      cached = config;
      return config;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function bannersForPlacement(config: AppConfig, placement: AppBanner['placement']): AppBanner[] {
  return config.banners.filter((b) => b.placement === placement);
}

export function adSlot(config: AppConfig, placement: AdSlot['placement']): AdSlot | undefined {
  return config.adSlots.find((s) => s.placement === placement);
}
