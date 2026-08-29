import { wpPublicGet } from './wpClient';
import { formatRelativeTime } from '../relativeTime';
import type { Article } from '../../data/types';

// Shape returned by the new businessday-app-connector WordPress plugin's feed endpoints —
// verified live against a running local WP install (wordpress-plugin/businessday-app-connector).
export type FeedItem = {
  id: number;
  headline: string;
  dek: string;
  section: string;
  sectionSlug: string;
  author: { id: number; name: string };
  publishedAt: string; // ISO 8601
  isPremium: boolean;
  imageUrl: string | null;
  featuredVideoId: string | null;
  link: string;
  tags: string[];
  commentCount: number;
  readTimeMinutes: number;
};

export type FeedResponse = { items: FeedItem[]; page: number; hasMore: boolean };

const HERO_COLORS = ['#B22800', '#1E7F4C', '#0B5FA5', '#7A4CB2', '#B2740B'];
function heroColorFor(id: number): string {
  return HERO_COLORS[id % HERO_COLORS.length];
}

// Real articles carry their full body only once entitlement is resolved (api/entitlement.ts) —
// `body` starts empty here deliberately, never guessed or padded client-side.
export function toArticle(item: FeedItem): Article {
  return {
    id: String(item.id),
    headline: item.headline,
    dek: item.dek,
    section: item.section,
    authorId: String(item.author.id),
    authorName: item.author.name,
    publishedAt: formatRelativeTime(item.publishedAt),
    contentType: 'news',
    isPremium: item.isPremium,
    readTime: `${item.readTimeMinutes} min read`,
    body: [],
    heroColor: heroColorFor(item.id),
    imageUrl: item.imageUrl ?? undefined,
    featuredVideoId: item.featuredVideoId ?? undefined,
    commentCount: item.commentCount,
    tags: item.tags,
    sourceUrl: item.link,
  };
}

// Bridges real feed results into ArticleReaderScreen's by-id lookup, which otherwise only knows
// about the static mock array — see ArticleReaderScreen.tsx. Populated as feeds are fetched, not
// pre-loaded, so memory stays bounded to what's actually been shown.
const registry = new Map<string, Article>();

export function registerArticles(items: FeedItem[]): Article[] {
  const articles = items.map(toArticle);
  for (const article of articles) registry.set(article.id, article);
  return articles;
}

// Universal-link deep linking: the OS hands the app a tapped article URL, not an id — this
// resolves it to a post id (via WordPress's own `url_to_postid()`, exposed by the connector
// plugin), then fetches and registers that single article, so a cold-started app opened straight
// into an article (never having fetched any feed yet) still has something in the registry for
// ArticleReaderScreen's by-id lookup to find.
export async function resolveArticleIdFromUrl(url: string): Promise<string | null> {
  try {
    const res = await wpPublicGet<{ id: number }>(`/wp-json/businessday-app/v1/resolve?url=${encodeURIComponent(url)}`);
    return String(res.id);
  } catch {
    return null;
  }
}

export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const res = await wpPublicGet<{ item: FeedItem }>(`/wp-json/businessday-app/v1/article/${id}`);
    return registerArticles([res.item])[0];
  } catch {
    return null;
  }
}

// For call sites that already have an Article-shaped object from a non-feed endpoint (e.g.
// Today's Paper's lean item shape, mapped locally) rather than a raw FeedItem.
export function registerArticle(article: Article): void {
  registry.set(article.id, article);
}

export function getRegisteredArticle(id: string): Article | undefined {
  return registry.get(id);
}

// `mixed` cycles the same hero/briefRail/tileGrid/textList/cardList variety category archives
// use; the rest force every article in the section into that one module shape — editor-chosen
// per section in wp-admin → BusinessDay App → Home Sections.
export type HomeSectionDisplayType = 'mixed' | 'hero' | 'briefRail' | 'tileGrid' | 'textList' | 'cardList';
export type HomeSection = {
  id: string;
  label: string;
  displayType: HomeSectionDisplayType;
  // Which archive endpoint "See all" for this section should hit — a tag-sourced section (e.g.
  // "Latest Stories"/bdrecent, "In Other News"/bdothernews) has no matching category, so slugifying
  // its display label and querying feed/section/{slug} (category-based) returns nothing.
  sourceType: 'category' | 'tag';
  sourceValue: string;
  articles: Article[];
};
export type HomeFeedResponse = {
  sections: { id: string; label: string; displayType?: string; sourceType?: string; sourceValue?: string; items: FeedItem[] }[];
  page: number;
  hasMore: boolean;
};

const HOME_SECTION_DISPLAY_TYPES: HomeSectionDisplayType[] = ['mixed', 'hero', 'briefRail', 'tileGrid', 'textList', 'cardList'];
function toDisplayType(value: string | undefined): HomeSectionDisplayType {
  return HOME_SECTION_DISPLAY_TYPES.includes(value as HomeSectionDisplayType) ? (value as HomeSectionDisplayType) : 'mixed';
}

// Home is editor-configured sections (wp-admin → BusinessDay App → Home Sections), not a flat
// list — see wordpress-plugin/businessday-app-connector's handleHome().
export async function getHomeFeed(): Promise<HomeSection[]> {
  const res = await wpPublicGet<HomeFeedResponse>('/wp-json/businessday-app/v1/feed/home');
  return res.sections.map((s) => ({
    id: s.id,
    label: s.label,
    displayType: toDisplayType(s.displayType),
    sourceType: s.sourceType === 'tag' ? 'tag' : 'category',
    sourceValue: s.sourceValue ?? '',
    articles: registerArticles(s.items),
  }));
}

// Query param is `pg`, not `page` — a bare `page=` query parameter reliably trips a Cloudflare
// WAF rule on the live site (returns an HTML JS-challenge page instead of JSON, which this app
// can never solve). Confirmed live against stg18326.businessday.ng: `?page=1` -> 403
// `cf-mitigated: challenge` on every route below, `?pg=1` -> 200. Must match class-bd-feed-api.php.
export async function getLatestFeed(page = 1): Promise<FeedResponse & { articles: Article[] }> {
  const res = await wpPublicGet<FeedResponse>(`/wp-json/businessday-app/v1/feed/latest?pg=${page}`);
  return { ...res, articles: registerArticles(res.items) };
}

export async function getSectionFeed(slug: string, page = 1): Promise<FeedResponse & { articles: Article[] }> {
  const res = await wpPublicGet<FeedResponse>(
    `/wp-json/businessday-app/v1/feed/section/${encodeURIComponent(slug)}?pg=${page}`
  );
  return { ...res, articles: registerArticles(res.items) };
}

// Tag-scoped, e.g. `bdrecent` — the real site's own editorial tag for "recent," distinct from a
// plain date-ordered query across every category. See handleTag() in
// wordpress-plugin/businessday-app-connector's class-bd-feed-api.php.
export async function getTagFeed(slug: string, page = 1): Promise<FeedResponse & { articles: Article[] }> {
  const res = await wpPublicGet<FeedResponse>(`/wp-json/businessday-app/v1/feed/tag/${encodeURIComponent(slug)}?pg=${page}`);
  return { ...res, articles: registerArticles(res.items) };
}

export type InterestCategory = { id: string; name: string };

// WordPress's own default REST API, not businessday-app-connector — mirrors the web reader SDK's
// interest-picker.ts exactly (same endpoint, same query params, same count>0 filter, same
// id-as-termId convention) so a followed category means the same thing on both platforms and a
// reader's picks actually match real, published content instead of a fixed made-up topic list.
export async function getInterestCategories(): Promise<InterestCategory[]> {
  const res = await wpPublicGet<Array<{ id: number; name: string; count: number }>>(
    '/wp-json/wp/v2/categories?per_page=100&orderby=name&order=asc&_fields=id,name,count'
  );
  return res.filter((c) => c.count > 0).map((c) => ({ id: String(c.id), name: c.name }));
}

export async function searchArticles(query: string): Promise<Article[]> {
  const res = await wpPublicGet<FeedResponse>(`/wp-json/businessday-app/v1/search?q=${encodeURIComponent(query)}`);
  return registerArticles(res.items);
}
