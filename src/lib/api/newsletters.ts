import { wpPublicGet } from './wpClient';

export type NewsletterList = {
  id: string;
  title: string;
  description: string;
};

export type NewsletterListsResponse = {
  lists: NewsletterList[];
};

// The site's real FluentCRM-backed newsletter lists (Appearance → BusinessDay Theme →
// Newsletter), same lists the website's signup box offers, via
// businessday-app-connector's /newsletters route.
export function getNewsletterLists(): Promise<NewsletterListsResponse> {
  return wpPublicGet<NewsletterListsResponse>('/wp-json/businessday-app/v1/newsletters');
}

export async function subscribeToNewsletters(
  email: string,
  listIds: string[],
  firstName?: string
): Promise<{ subscribed: true }> {
  const base = process.env.EXPO_PUBLIC_WP_BASE_URL ?? '';
  const res = await fetch(`${base}/wp-json/businessday-app/v1/newsletters/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, lists: listIds, firstName: firstName ?? '' }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Couldn't complete signup. Please try again.");
  }
  return res.json();
}
