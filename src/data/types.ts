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
  publishedAt: string; // relative label, e.g. "2h ago"
  contentType: ContentType;
  isPremium: boolean;
  isLive?: boolean;
  readTime: string;
  body: string[];
  heroColor: string;
  isBrief?: boolean;
  commentCount?: number;
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
};

export type VideoItem = {
  id: string;
  title: string;
  channel: string;
  duration: string;
  playlist: string;
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
};

export type NewsletterIssue = {
  id: string;
  title: string;
  summary: string;
  sentAt: string;
};

export type TodayModule =
  | { type: 'hero'; articleId: string }
  | { type: 'briefRail'; label: string; articleIds: string[] }
  | { type: 'sectionLabel'; label: string }
  | { type: 'cardList'; articleIds: string[] }
  | { type: 'tileGrid'; label: string; articleIds: string[] }
  | { type: 'textList'; label: string; articleIds: string[] };

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: string;
  cadence: 'monthly' | 'annual' | 'student' | 'corporate';
  highlight?: boolean;
  features: string[];
};

export type Persona = {
  id: 'investor' | 'entrepreneur' | 'policy' | 'student' | 'general';
  label: string;
  description: string;
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
  status: 'Paid' | 'Refunded';
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};
