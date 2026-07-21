import {
  Article,
  Author,
  Comment,
  CorrectionEntry,
  GameEntry,
  Invoice,
  MarketQuote,
  NewsletterIssue,
  NotificationItem,
  Persona,
  PodcastEpisode,
  QuizQuestion,
  ShortVideoItem,
  SubscriptionPlan,
  TodayModule,
  VideoItem,
} from './types';
import { ALL_EXTRA_TAGS, buildSectionArticles } from './generatedArticles';
import { minutesAgo } from '../lib/relativeTime';

export const authors: Author[] = [
  { id: 'a1', name: 'Amaka Eze', title: 'Banking & Finance Editor', avatarColor: '#F73200' },
  { id: 'a2', name: 'Tunde Bakare', title: 'Markets Correspondent', avatarColor: '#1E7F4C' },
  { id: 'a3', name: 'Chiamaka Nwosu', title: 'Energy Reporter', avatarColor: '#333333' },
  { id: 'a4', name: 'Segun Adeyemi', title: 'Policy & Economy Editor', avatarColor: '#111111' },
];

export const interestTopics = [
  'Banking',
  'Markets',
  'Energy',
  'Technology',
  'Real Estate',
  'Agriculture',
  'Policy',
  'Manufacturing',
] as const;

export const sections = [
  'Top Stories',
  'Banking',
  'Markets',
  'Energy',
  'Technology',
  'Policy',
  'Opinion',
] as const;

export const marketTicker: MarketQuote[] = [
  { symbol: 'NGX', label: 'NGX All-Share', value: '98,452.11', changePct: 0.8, category: 'Indices' },
  { symbol: 'USDNGN', label: 'USD/NGN', value: '1,532.40', changePct: -0.3, category: 'FX' },
  { symbol: 'BRENT', label: 'Brent Crude', value: '$83.12', changePct: 1.2, category: 'Commodities' },
  { symbol: 'GOLD', label: 'Gold', value: '$2,398.50', changePct: 0.1, category: 'Commodities' },
  { symbol: 'BTC', label: 'Bitcoin', value: '$67,204', changePct: -1.4, category: 'Crypto' },
];

export const marketQuotes: MarketQuote[] = [
  ...marketTicker,
  { symbol: 'S&P500', label: 'S&P 500', value: '5,822.40', changePct: 0.4, category: 'Indices' },
  { symbol: 'GBPNGN', label: 'GBP/NGN', value: '1,948.10', changePct: 0.2, category: 'FX' },
  { symbol: 'EURNGN', label: 'EUR/NGN', value: '1,662.75', changePct: -0.1, category: 'FX' },
  { symbol: 'SILVER', label: 'Silver', value: '$29.84', changePct: -0.5, category: 'Commodities' },
  { symbol: 'ETH', label: 'Ethereum', value: '$3,412', changePct: 2.1, category: 'Crypto' },
];

const curatedArticles: Article[] = [
  {
    id: 'art-1',
    headline: 'Naira steadies as reserves cross $40bn mark',
    dek: 'Reserves rose on higher oil receipts and FX inflows, easing pressure on the exchange rate for a third straight week.',
    section: 'Banking',
    authorId: 'a1',
    publishedAt: '2h ago',
    contentType: 'news',
    isPremium: false,
    readTime: '4 min read',
    heroColor: '#F73200',
    imageUrl: 'https://picsum.photos/seed/art-1/800/600',
    commentCount: 12,
    body: [
      'The naira held steady against the dollar this week as external reserves crossed the $40 billion mark for the first time in eighteen months, according to figures released by the Central Bank of Nigeria.',
      'Analysts attributed the rally to a combination of higher oil receipts, improved FX inflows from portfolio investors, and sustained intervention by the apex bank in the official window.',
      'Still, some economists cautioned that the reserve build-up may prove fragile if oil prices retreat or if capital flows reverse amid tightening global financial conditions.',
    ],
  },
  {
    id: 'art-2',
    headline: 'Dangote refinery output rises as export volumes climb',
    dek: 'The 650,000 bpd facility ramped up diesel and jet fuel exports to European buyers in the second quarter.',
    section: 'Energy',
    authorId: 'a3',
    publishedAt: '4h ago',
    contentType: 'news',
    isPremium: false,
    readTime: '3 min read',
    heroColor: '#333333',
    imageUrl: 'https://picsum.photos/seed/art-2/800/600',
    isBrief: true,
    body: [
      'Dangote Petroleum Refinery increased its export volumes of diesel and aviation fuel in the second quarter, according to shipping data reviewed by BusinessDay.',
      'The ramp-up comes as the refinery works toward full utilisation of its 650,000 barrels-per-day capacity, a milestone that could materially reduce Nigeria’s reliance on imported refined products.',
    ],
  },
  {
    id: 'art-3',
    headline: 'Full sector analysis: What CBN’s rate hold means for banks’ Q3 earnings',
    dek: 'A deep dive into net interest margins, loan-loss provisioning, and capital adequacy across Tier-1 lenders.',
    section: 'Banking',
    authorId: 'a1',
    publishedAt: '6h ago',
    contentType: 'analysis',
    isPremium: true,
    readTime: '9 min read',
    heroColor: '#111111',
    imageUrl: 'https://picsum.photos/seed/art-3/800/600',
    body: [
      'The Central Bank of Nigeria’s decision to hold its benchmark rate steady at last week’s MPC meeting sends a mixed signal to the banking sector heading into third-quarter earnings season.',
      'BusinessDay’s analysis of five Tier-1 lenders’ balance sheets suggests net interest margins will likely compress modestly, even as loan books continue to reprice upward from the prior tightening cycle.',
      'This is the point at which the preview ends for non-subscribers — the full breakdown includes bank-by-bank margin forecasts, provisioning trends, and a comparison against the 2023 cycle.',
      'Capital adequacy ratios across the sample remain comfortably above the regulatory minimum, but two lenders are flagged as needing to raise fresh capital within the next two reporting cycles to fund growth.',
    ],
  },
  {
    id: 'art-4',
    headline: 'NGX adds ₦130bn in value as banking stocks rally',
    dek: 'Tier-1 lenders led gains after strong half-year results beat analyst expectations across the board.',
    section: 'Markets',
    authorId: 'a2',
    publishedAt: '8h ago',
    contentType: 'news',
    isPremium: false,
    readTime: '3 min read',
    heroColor: '#1E7F4C',
    imageUrl: 'https://picsum.photos/seed/art-4/800/600',
    isBrief: true,
    commentCount: 4,
    body: [
      'The Nigerian Exchange added ₦130 billion in market capitalisation on Thursday as banking stocks led a broad rally following a string of strong half-year results.',
      'GTCO, Zenith Bank, and Access Holdings posted the largest single-day gains, each closing up more than 4 percent.',
    ],
  },
  {
    id: 'art-5',
    headline: 'Premium report: Nigeria’s fintech funding winter, one year on',
    dek: 'Exclusive data on Series A/B deal flow, valuations, and which sub-sectors are still attracting capital.',
    section: 'Technology',
    authorId: 'a4',
    publishedAt: '1d ago',
    contentType: 'report',
    isPremium: true,
    readTime: '11 min read',
    heroColor: '#F73200',
    imageUrl: 'https://picsum.photos/seed/art-5/800/600',
    body: [
      'A year after global investors pulled back sharply from African fintech, BusinessDay’s proprietary deal-tracking data shows an uneven recovery taking shape.',
      'Payments infrastructure and B2B commerce platforms have seen renewed interest from regional funds, while consumer lending startups continue to struggle to raise beyond seed stage.',
      'This report includes exclusive valuation benchmarks compiled from more than 40 disclosed and undisclosed rounds across the past twelve months.',
    ],
  },
  {
    id: 'art-6',
    headline: 'Inflation eases to 22.1% as food prices moderate',
    dek: 'Headline inflation slowed for a second consecutive month, driven by a seasonal easing in food prices.',
    section: 'Policy',
    authorId: 'a4',
    publishedAt: '1d ago',
    contentType: 'news',
    isPremium: false,
    readTime: '3 min read',
    heroColor: '#333333',
    imageUrl: 'https://picsum.photos/seed/art-6/800/600',
    isBrief: true,
    body: [
      'Nigeria’s headline inflation rate eased to 22.1 percent in the year to last month, according to the National Bureau of Statistics, marking a second straight month of moderation.',
      'Food inflation, the largest component of the basket, slowed to 24.3 percent as harvest-season supply improved across staple crops.',
    ],
  },
];

// Every real section gets a deterministic pool of 100+ generated articles (see generatedArticles.ts)
// so every Home category tab and taxonomy archive has enough content to scroll through, on top of
// the small hand-authored `curatedArticles` set above (kept for narrative/demo consistency, e.g. the
// hero/module sequence and cross-references from Notifications/Corrections/etc).
const authorIds = authors.map((a) => a.id);
const generatedArticles: Article[] = sections
  .filter((s) => s !== 'Top Stories')
  .flatMap((section) => buildSectionArticles(section, 100, authorIds));

export const articles: Article[] = [...curatedArticles, ...generatedArticles];

// The full taxonomy universe for the Latest → Explore tag cloud: every Home category tab, every
// onboarding interest topic, plus each section's secondary tags (SECTION_EXTRA_TAGS) — 30+ terms,
// matching how a real WordPress install's category + tag taxonomies would read. Deduped.
export const taxonomies: string[] = Array.from(
  new Set<string>([...sections, ...interestTopics, ...ALL_EXTRA_TAGS])
);

// Every post tagged to a given taxonomy — matches on `section` (categories) OR `tags` (secondary
// topics), same "OR" match a real WP taxonomy query would do. 'Top Stories' means "everything."
export function articlesForTaxonomy(name: string): Article[] {
  if (name === 'Top Stories') return articles;
  return articles.filter((a) => a.section === name || a.tags?.includes(name));
}

// Newest-first recency for a taxonomy — drives Explore's "most recently published" ordering.
export function taxonomyFreshnessMinutes(name: string): number {
  const matches = articlesForTaxonomy(name);
  if (matches.length === 0) return Number.MAX_SAFE_INTEGER;
  return Math.min(...matches.map((a) => minutesAgo(a.publishedAt)));
}

export const breakingArticle: Article = {
  id: 'art-breaking',
  headline: 'CBN raises MPR by 50bps to 27.25% in surprise move',
  dek: 'The Monetary Policy Committee cited persistent inflationary pressure and naira volatility in its decision.',
  section: 'Banking',
  authorId: 'a1',
  publishedAt: 'Just now',
  contentType: 'news',
  isPremium: false,
  isLive: true,
  readTime: '2 min read',
  heroColor: '#F73200',
  imageUrl: 'https://picsum.photos/seed/art-breaking/800/600',
  body: [
    'The Central Bank of Nigeria’s Monetary Policy Committee raised the benchmark interest rate by 50 basis points to 27.25 percent on Tuesday, a move that caught most market watchers off guard.',
    'This is a developing story. BusinessDay will update this article as more details become available.',
  ],
};

export const podcasts: PodcastEpisode[] = [
  {
    id: 'pod-daily',
    show: 'Daily Briefing',
    title: 'What moved markets today: CBN, Dangote, and the naira',
    duration: '6 min',
    publishedAt: 'Today, 6:00am',
    isDailyBriefing: true,
    artworkUrl: 'https://picsum.photos/seed/pod-daily/300/300',
  },
  {
    id: 'pod-1',
    show: 'BusinessDay Conversations',
    title: 'Inside Nigeria’s fintech funding winter, with Tosin Faniro-Dada',
    duration: '38 min',
    publishedAt: '2 days ago',
    artworkUrl: 'https://picsum.photos/seed/pod-1/300/300',
  },
  {
    id: 'pod-2',
    show: 'Markets Weekly',
    title: 'Why banking stocks are outperforming the broader index',
    duration: '24 min',
    publishedAt: '3 days ago',
    artworkUrl: 'https://picsum.photos/seed/pod-2/300/300',
  },
  {
    id: 'pod-3',
    show: 'Policy Room',
    title: 'Decoding the 2026 fiscal framework',
    duration: '31 min',
    publishedAt: '5 days ago',
    artworkUrl: 'https://picsum.photos/seed/pod-3/300/300',
  },
  {
    id: 'pod-4',
    show: 'BusinessDay Conversations',
    title: 'Building for the next 100 million African bank accounts',
    duration: '42 min',
    publishedAt: '6 days ago',
    artworkUrl: 'https://picsum.photos/seed/pod-4/300/300',
  },
  {
    id: 'pod-5',
    show: 'Markets Weekly',
    title: 'Reading the yield curve: what the Treasury bills market is signalling',
    duration: '19 min',
    publishedAt: '1 week ago',
    artworkUrl: 'https://picsum.photos/seed/pod-5/300/300',
  },
  {
    id: 'pod-6',
    show: 'Energy Desk',
    title: 'Inside the Dangote Refinery\'s export ramp-up',
    duration: '27 min',
    publishedAt: '1 week ago',
    artworkUrl: 'https://picsum.photos/seed/pod-6/300/300',
  },
  {
    id: 'pod-7',
    show: 'Policy Room',
    title: 'What the new tax reform bill means for SMEs',
    duration: '33 min',
    publishedAt: '9 days ago',
    artworkUrl: 'https://picsum.photos/seed/pod-7/300/300',
  },
  {
    id: 'pod-8',
    show: 'BusinessDay Conversations',
    title: 'Real estate financing after the mortgage reform, with industry leaders',
    duration: '35 min',
    publishedAt: '10 days ago',
    artworkUrl: 'https://picsum.photos/seed/pod-8/300/300',
  },
  {
    id: 'pod-9',
    show: 'Markets Weekly',
    title: 'Currency watch: three scenarios for the naira into year-end',
    duration: '22 min',
    publishedAt: '2 weeks ago',
    artworkUrl: 'https://picsum.photos/seed/pod-9/300/300',
  },
];

export const videos: VideoItem[] = [
  { id: 'vid-1', title: 'Inside the Dangote Refinery: A Rare Tour', channel: 'BusinessDay TV', duration: '12:04', playlist: 'Features', thumbnailUrl: 'https://picsum.photos/seed/vid-1/600/340' },
  { id: 'vid-2', title: 'CBN Governor on Rate Decision: Full Interview', channel: 'BusinessDay TV', duration: '18:41', playlist: 'Interviews', thumbnailUrl: 'https://picsum.photos/seed/vid-2/600/340' },
  { id: 'vid-3', title: 'Market Analysis: Banking Sector Q2 Earnings', channel: 'BusinessDay TV', duration: '9:22', playlist: 'Market Analysis', thumbnailUrl: 'https://picsum.photos/seed/vid-3/600/340' },
  { id: 'vid-4', title: 'The Fintech Founders Redefining Payments', channel: 'BusinessDay TV', duration: '15:10', playlist: 'Features', thumbnailUrl: 'https://picsum.photos/seed/vid-4/600/340' },
  { id: 'vid-5', title: 'Inside Lagos\' New Deep Sea Port', channel: 'BusinessDay TV', duration: '11:36', playlist: 'Features', thumbnailUrl: 'https://picsum.photos/seed/vid-5/600/340' },
  { id: 'vid-6', title: 'Finance Minister on the 2026 Fiscal Framework', channel: 'BusinessDay TV', duration: '21:08', playlist: 'Interviews', thumbnailUrl: 'https://picsum.photos/seed/vid-6/600/340' },
  { id: 'vid-7', title: 'Market Analysis: NGX Mid-Year Review', channel: 'BusinessDay TV', duration: '13:47', playlist: 'Market Analysis', thumbnailUrl: 'https://picsum.photos/seed/vid-7/600/340' },
  { id: 'vid-8', title: 'How Moniepoint Scaled to a Unicorn', channel: 'BusinessDay TV', duration: '16:29', playlist: 'Features', thumbnailUrl: 'https://picsum.photos/seed/vid-8/600/340' },
  { id: 'vid-9', title: 'Agribusiness Founders on Feeding a Continent', channel: 'BusinessDay TV', duration: '14:02', playlist: 'Features', thumbnailUrl: 'https://picsum.photos/seed/vid-9/600/340' },
  { id: 'vid-10', title: 'Power Sector Reform: An Explainer', channel: 'BusinessDay TV', duration: '8:55', playlist: 'Market Analysis', thumbnailUrl: 'https://picsum.photos/seed/vid-10/600/340' },
];

export const shorts: ShortVideoItem[] = [
  { id: 'short-1', title: "Naira in 60 seconds: this week's move", description: "Reserves, the parallel rate, and what's driving both this week.", channel: 'BusinessDay TV', duration: '0:58', thumbnailUrl: 'https://picsum.photos/seed/short-1/720/1280', likeCount: 842, commentCount: 46 },
  { id: 'short-2', title: '3 charts on the NGX rally', description: 'Banking stocks, market breadth, and foreign inflows — charted fast.', channel: 'BusinessDay TV', duration: '0:42', thumbnailUrl: 'https://picsum.photos/seed/short-2/720/1280', likeCount: 613, commentCount: 28 },
  { id: 'short-3', title: 'What is a Treasury bill? Explained fast', description: 'The basics of T-bills, yields, and why they move so much money.', channel: 'BusinessDay TV', duration: '1:05', thumbnailUrl: 'https://picsum.photos/seed/short-3/720/1280', likeCount: 1204, commentCount: 91 },
  { id: 'short-4', title: 'Inside Dangote Refinery in 60 seconds', description: 'A rare look at the 650,000 bpd facility, condensed.', channel: 'BusinessDay TV', duration: '0:51', thumbnailUrl: 'https://picsum.photos/seed/short-4/720/1280', likeCount: 2031, commentCount: 154 },
  { id: 'short-5', title: 'Quick take: MPC rate decision', description: "What the 50bps hike means for borrowers and savers.", channel: 'BusinessDay TV', duration: '0:47', thumbnailUrl: 'https://picsum.photos/seed/short-5/720/1280', likeCount: 789, commentCount: 63 },
  { id: 'short-6', title: 'Fintech funding, one chart', description: "A year of Series A/B deal flow, visualised.", channel: 'BusinessDay TV', duration: '0:39', thumbnailUrl: 'https://picsum.photos/seed/short-6/720/1280', likeCount: 455, commentCount: 19 },
  { id: 'short-7', title: 'Inflation, explained in a minute', description: 'Headline vs. food inflation, and why the gap matters.', channel: 'BusinessDay TV', duration: '1:02', thumbnailUrl: 'https://picsum.photos/seed/short-7/720/1280', likeCount: 967, commentCount: 72 },
  { id: 'short-8', title: 'Behind the scenes: BusinessDay newsroom', description: 'How a front page comes together on deadline.', channel: 'BusinessDay TV', duration: '0:55', thumbnailUrl: 'https://picsum.photos/seed/short-8/720/1280', likeCount: 1580, commentCount: 203 },
];

export const games: GameEntry[] = [
  { id: 'game-crossword', title: 'Daily Crossword', kind: 'crossword', streak: 4, playedToday: false },
  { id: 'game-quiz', title: 'News Recall Quiz', kind: 'quiz', streak: 12, playedToday: true },
];

export const notifications: NotificationItem[] = [
  { id: 'n1', category: 'Breaking News', title: 'CBN raises MPR by 50bps to 27.25%', body: 'The Monetary Policy Committee cited persistent inflationary pressure.', receivedAt: '2m ago', articleId: 'art-breaking' },
  { id: 'n2', category: 'Market Moves', title: 'NGX up 1.2% at midday', body: 'Banking stocks lead gains after strong half-year results.', receivedAt: '3h ago', articleId: 'art-4' },
  { id: 'n3', category: 'Weekly Briefing', title: 'Your Friday briefing is ready', body: '5 stories that moved Banking & Energy this week.', receivedAt: '1d ago' },
  { id: 'n4', category: 'Game & Quiz Reminders', title: 'Keep your streak alive', body: 'You have a 12-day streak on News Recall Quiz. Play today’s round.', receivedAt: '1d ago' },
];

// The newsletter list itself (title, summary, cadence, and each one's latest edition) is
// exactly the kind of publisher-owned config IMPLEMENTATION_PLAN.md §9.5's WP-admin curation
// plugin should manage — editors publish a new "latest edition" from WordPress without an app
// release, the same pattern already flagged for Home's category tabs.
export const newsletters: NewsletterIssue[] = [
  {
    id: 'nl-1',
    title: 'The Friday Briefing: Banking & Energy',
    summary: '5 stories that moved Banking & Energy this week.',
    sentAt: 'Fri, 8:00am',
    latestEditionSubject: 'Reserves cross $40bn, and three refinery stories to watch',
    latestEditionBody: [
      'Good morning — here are five stories that moved Banking & Energy this week.',
      '1. External reserves crossed $40bn for the first time in eighteen months, easing pressure on the naira.',
      '2. Dangote Refinery lifted export volumes of diesel and jet fuel to European buyers in Q2.',
      '3. Tier-1 banks posted strong half-year results, led by GTCO and Zenith Bank.',
      '4. The CBN held its benchmark rate steady, a mixed signal heading into Q3 earnings season.',
      '5. Two lenders were flagged as needing fresh capital within two reporting cycles.',
      'That\'s your Friday Briefing — see you next week.',
    ],
  },
  {
    id: 'nl-2',
    title: 'Market Movers Weekly',
    summary: 'NGX, naira, and the week’s biggest sector rotations.',
    sentAt: 'Last Friday',
    latestEditionSubject: 'Banking stocks lead a ₦130bn rally on the NGX',
    latestEditionBody: [
      'The Nigerian Exchange added ₦130 billion in market capitalisation this week as banking stocks led a broad rally.',
      'GTCO, Zenith Bank, and Access Holdings posted the largest single-day gains, each closing up more than 4 percent.',
      'Foreign portfolio investors returned to the local bourse for a second straight week, per NGX flow data.',
      'Fixed income: Treasury bill yields eased slightly on renewed demand at this week\'s auction.',
      'Watch next week: Q3 earnings season kicks off in earnest with three Tier-1 banks reporting.',
    ],
  },
  {
    id: 'nl-3',
    title: 'Policy Watch',
    summary: 'What the new fiscal framework means for business.',
    sentAt: '2 weeks ago',
    latestEditionSubject: 'Inflation eases to 22.1% — what it means for the 2026 fiscal framework',
    latestEditionBody: [
      'Headline inflation eased to 22.1 percent this month, the second straight month of moderation, per the NBS.',
      'Food inflation, the largest component of the basket, slowed to 24.3 percent as harvest-season supply improved.',
      'The Debt Management Office signalled a lighter borrowing calendar for the second half of the fiscal year.',
      'The Federal Ministry of Finance is expected to present its revised 2026 fiscal framework to the National Assembly next month.',
      'What we\'re watching: whether the moderation gives the CBN room to ease its benchmark rate at the next MPC meeting.',
    ],
  },
];

// Stands in for a WP-admin "App content" setting: the publisher uploads a new PDF each day and
// this URL updates from the dashboard — the app never bundles the file itself.
export const todaysPaperPdfUrl = 'https://www.africau.edu/images/default/sample.pdf';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-monthly',
    name: 'Premium Monthly',
    price: '₦2,500/month',
    cadence: 'monthly',
    features: ['Unlimited articles & reports', 'Full market data', 'Ad-free reading', 'Offline downloads'],
  },
  {
    id: 'plan-annual',
    name: 'Premium Annual',
    price: '₦25,000/year',
    cadence: 'annual',
    highlight: true,
    features: ['Everything in Monthly', '2 months free', 'Priority Sia access', 'Early access to reports'],
  },
  {
    id: 'plan-student',
    name: 'Student',
    price: '₦1,200/month',
    cadence: 'student',
    features: ['Unlimited articles & reports', 'Ad-free reading', 'Valid student ID required'],
  },
];

export const freeArticlesRemaining = 0; // drives paywall trigger in the prototype
export const freeArticlesLimit = 3;

export const personas: Persona[] = [
  { id: 'investor', label: 'Investor', description: 'Track markets, earnings, and macro moves that affect your portfolio.' },
  { id: 'entrepreneur', label: 'Entrepreneur', description: 'Follow policy, funding, and sector trends that shape your business.' },
  { id: 'policy', label: 'Policy professional', description: 'Deep, sourced coverage of regulation and government decisions.' },
  { id: 'student', label: 'Student', description: 'Business fundamentals and context, explained clearly.' },
  { id: 'general', label: 'General reader', description: 'A broad, curated view of the day’s business news.' },
];

export const corrections: CorrectionEntry[] = [
  {
    id: 'c1',
    articleId: 'art-1',
    date: '3 days ago',
    note: 'An earlier version of this article misstated external reserves as $38bn; it has been corrected to $40bn, per revised CBN figures.',
  },
  {
    id: 'c2',
    articleId: 'art-6',
    date: '1 week ago',
    note: 'This article was updated to reflect the NBS’s revised food inflation sub-index, published after initial publication.',
  },
];

export const invoices: Invoice[] = [
  { id: 'inv-3', date: '1 Sep 2026', description: 'Premium Annual — renewal attempt', amount: '₦25,000', status: 'Failed' },
  { id: 'inv-2', date: '1 Jun 2026', description: 'Premium Annual — renewal', amount: '₦25,000', status: 'Paid' },
  { id: 'inv-1', date: '1 Jun 2025', description: 'Premium Annual — first year', amount: '₦25,000', status: 'Paid' },
];

// Stands in for the WordPress site's own comment thread (wp-comments) for each post — a real
// integration would fetch/post against WP's REST comments endpoint per article ID.
export const comments: Comment[] = [
  {
    id: 'cm-1',
    articleId: 'art-1',
    author: 'Chinedu O.',
    avatarColor: '#1E7F4C',
    body: "Good to see the reserves build-up holding. Curious how much of this is oil receipts vs portfolio inflows.",
    postedAt: '1h ago',
  },
  {
    id: 'cm-2',
    articleId: 'art-1',
    author: 'Aisha B.',
    avatarColor: '#F73200',
    body: 'Third straight week of gains is genuinely encouraging, but the CBN has surprised us before.',
    postedAt: '45m ago',
  },
  {
    id: 'cm-3',
    articleId: 'art-1',
    author: 'Femi A.',
    avatarColor: '#333333',
    body: "Would love a follow-up on what this means for import-dependent manufacturers.",
    postedAt: '20m ago',
  },
  {
    id: 'cm-4',
    articleId: 'art-4',
    author: 'Ngozi K.',
    avatarColor: '#B22800',
    body: 'GTCO leading the rally is no surprise after that earnings beat.',
    postedAt: '3h ago',
  },
  {
    id: 'cm-5',
    articleId: 'art-breaking',
    author: 'Tunde R.',
    avatarColor: '#1E7F4C',
    body: '50bps was more aggressive than most desks were pricing in this morning.',
    postedAt: '5m ago',
  },
];

export function commentsForArticle(articleId: string): Comment[] {
  return comments.filter((c) => c.articleId === articleId);
}

export const quizQuestions: QuizQuestion[] = [
  { id: 'q1', prompt: 'External reserves crossed what mark this week?', options: ['$30bn', '$40bn', '$50bn'], correctIndex: 1 },
  { id: 'q2', prompt: 'Which sector led the NGX rally reported today?', options: ['Oil & Gas', 'Banking', 'Telecoms'], correctIndex: 1 },
  { id: 'q3', prompt: 'What is Nigeria’s latest headline inflation rate?', options: ['18.2%', '22.1%', '27.25%'], correctIndex: 1 },
  { id: 'q4', prompt: 'What is the Dangote refinery’s stated capacity?', options: ['350,000 bpd', '650,000 bpd', '1m bpd'], correctIndex: 1 },
  { id: 'q5', prompt: 'By how much did the CBN raise its benchmark rate?', options: ['25bps', '50bps', '100bps'], correctIndex: 1 },
];

// design.md §6 — drives HomeScreen's "Today" tab mixed module layout. "Which articles go where" as data,
// not scattered filters inside the screen component.
export const todayModuleSequence: TodayModule[] = [
  { type: 'hero', articleId: 'art-breaking' },
  { type: 'briefRail', label: 'World in Brief', articleIds: ['art-2', 'art-4', 'art-6'] },
  { type: 'sectionLabel', label: 'Top Stories' },
  { type: 'cardList', articleIds: ['art-1', 'art-3', 'art-5'] },
  { type: 'tileGrid', label: 'Recent Highlights', articleIds: ['art-2', 'art-4'] },
  { type: 'textList', label: 'More from Markets', articleIds: ['art-1', 'art-6'] },
];
