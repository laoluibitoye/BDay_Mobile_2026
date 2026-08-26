import { wpPublicGet } from './wpClient';

export type MarketPulseItem = {
  id: string;
  label: string;
  value: string;
  note: string;
  note_type: 'percent' | 'text';
};

export type MarketPulseResponse = {
  items: MarketPulseItem[];
  scroll_seconds: number;
};

// The site's real, admin-edited market-data ticker (Appearance → BusinessDay Theme → Market
// Pulse) — same figures the website shows, no live third-party feed (see the plugin's own
// docblock for why one isn't reintroduced here).
export function getMarketPulse(): Promise<MarketPulseResponse> {
  return wpPublicGet<MarketPulseResponse>('/wp-json/businessday-app/v1/market-pulse');
}
