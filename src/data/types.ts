export type ContentType = 'news' | 'analysis' | 'report' | 'data';

export type Author = {
  id: string;
  name: string;
  title: string;
  avatarColor: string;
};

export type Article = {
  id: string;
  headline: string;
  dek: string;
  section: string;
  authorId: string;
  authorName: string;
  publishedAt: string; // relative label, e.g. "2h ago"
  contentType: ContentType;
  isPremium: boolean;
  isLive?: boolean;
  readTime: string;
  body: string[];
  heroColor: string;
  imageUrl?: string; // real photo, when present — falls back to heroColor when absent/loading/errored
  featuredVideoId?: string; // YouTube video id set as the article's featured media (editorial-meta metabox on the theme)
  isBrief?: boolean;
  commentCount?: number;
  tags?: string[]; // secondary taxonomy tags, in addition to `section` — powers the Explore tag cloud
  sourceUrl?: string; // real WordPress permalink — present only for articles sourced from a live feed, used for gifting/sharing a canonical link
};

export type MarketQuote = {
  symbol: string;
  label: string;
  value: string;
  changePct: number; // positive = up
  category: 'Indices' | 'FX' | 'Commodities' | 'Crypto';
};

export type PodcastEpisode = {
  id: string;
  show: string;
  title: string;
  duration: string;
  publishedAt: string;
  isDailyBriefing?: boolean;
  artworkUrl?: string;
};

export type VideoItem = {
  id: string;
  title: string;
  channel: string;
  duration: string;
  playlist: string;
  thumbnailUrl?: string;
};

export type ShortVideoItem = {
  id: string;
  title: string;
  description: string;
  channel: string;
  duration: string;
  thumbnailUrl?: string;
  likeCount: number;
  commentCount: number;
};

export type GameEntry = {
  id: string;
  title: string;
  kind: 'crossword' | 'quiz';
  streak: number;
  playedToday: boolean;
};

export type NotificationItem = {
  id: string;
  category: 'Breaking News' | 'Market Moves' | 'Weekly Briefing' | 'Game & Quiz Reminders';
  title: string;
  body: string;
  receivedAt: string;
  articleId?: string; // present when the notification deep-links to an article
};

export type NewsletterIssue = {
  id: string;
  title: string;
  summary: string;
  sentAt: string;
  latestEditionSubject: string; // headline of the most recent issue
  latestEditionBody: string[]; // full text of the most recent issue, shown in "View latest edition"
};

export type TodayModule =
  | { type: 'hero'; articleId: string }
  | { type: 'briefRail'; label: string; articleIds: string[] }
  | { type: 'sectionLabel'; label: string }
  | { type: 'cardList'; articleIds: string[] }
  | { type: 'tileGrid'; label: string; articleIds: string[] }
  | { type: 'textList'; label: string; articleIds: string[] }
  | { type: 'editionsCarousel' };

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: string;
  cadence: 'monthly' | 'annual' | 'student' | 'corporate';
  highlight?: boolean;
  features: string[];
};


export type CorrectionEntry = {
  id: string;
  articleId: string;
  date: string;
  note: string;
};

export type Invoice = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'Paid' | 'Refunded' | 'Failed';
};

export type Comment = {
  id: string;
  articleId: string;
  author: string;
  avatarColor: string;
  body: string;
  postedAt: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};
