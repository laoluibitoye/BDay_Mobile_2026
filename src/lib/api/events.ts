import { wpPublicGet } from './wpClient';

export type EventItem = {
  id: number;
  title: string;
  venue: string;
  dateRaw: string | null;
  dateIso: string | null;
  time: string;
  registerUrl: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: string;
  link: string;
};

export type EventsResponse = {
  items: EventItem[];
};

// The real `events` CPT — same source the website's homepage Events row uses. Dates are free
// text on the website (no date picker), so `dateIso` is only present when the server's
// strtotime() parse succeeded — always fall back to `dateRaw` for display when it's null.
export function getEvents(): Promise<EventsResponse> {
  return wpPublicGet<EventsResponse>('/wp-json/businessday-app/v1/events');
}
