import {
  Article,
  Author,
  CorrectionEntry,
  GameEntry,
  Invoice,
  MarketQuote,
  NewsletterIssue,
  NotificationItem,
  Persona,
  PodcastEpisode,
  QuizQuestion,
  SubscriptionPlan,
  TodayModule,
  VideoItem,
} from './types';

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

export const articles: Article[] = [
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
    isBrief: true,
    body: [
      'Nigeria’s headline inflation rate eased to 22.1 percent in the year to last month, according to the National Bureau of Statistics, marking a second straight month of moderation.',
      'Food inflation, the largest component of the basket, slowed to 24.3 percent as harvest-season supply improved across staple crops.',
    ],
  },
];

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
  },
  {
    id: 'pod-1',
    show: 'BusinessDay Conversations',
    title: 'Inside Nigeria’s fintech funding winter, with Tosin Faniro-Dada',
    duration: '38 min',
    publishedAt: '2 days ago',
  },
  {
    id: 'pod-2',
    show: 'Markets Weekly',
    title: 'Why banking stocks are outperforming the broader index',
    duration: '24 min',
    publishedAt: '3 days ago',
  },
  {
    id: 'pod-3',
    show: 'Policy Room',
    title: 'Decoding the 2026 fiscal framework',
    duration: '31 min',
    publishedAt: '5 days ago',
  },
];

export const videos: VideoItem[] = [
  { id: 'vid-1', title: 'Inside the Dangote Refinery: A Rare Tour', channel: 'BusinessDay TV', duration: '12:04', playlist: 'Features' },
  { id: 'vid-2', title: 'CBN Governor on Rate Decision: Full Interview', channel: 'BusinessDay TV', duration: '18:41', playlist: 'Interviews' },
  { id: 'vid-3', title: 'Market Analysis: Banking Sector Q2 Earnings', channel: 'BusinessDay TV', duration: '9:22', playlist: 'Market Analysis' },
  { id: 'vid-4', title: 'The Fintech Founders Redefining Payments', channel: 'BusinessDay TV', duration: '15:10', playlist: 'Features' },
];

export const games: GameEntry[] = [
  { id: 'game-crossword', title: 'Daily Crossword', kind: 'crossword', streak: 4, playedToday: false },
  { id: 'game-quiz', title: 'News Recall Quiz', kind: 'quiz', streak: 12, playedToday: true },
];

export const notifications: NotificationItem[] = [
  { id: 'n1', category: 'Breaking News', title: 'CBN raises MPR by 50bps to 27.25%', body: 'The Monetary Policy Committee cited persistent inflationary pressure.', receivedAt: '2m ago' },
  { id: 'n2', category: 'Market Moves', title: 'NGX up 1.2% at midday', body: 'Banking stocks lead gains after strong half-year results.', receivedAt: '3h ago' },
  { id: 'n3', category: 'Weekly Briefing', title: 'Your Friday briefing is ready', body: '5 stories that moved Banking & Energy this week.', receivedAt: '1d ago' },
  { id: 'n4', category: 'Game & Quiz Reminders', title: 'Keep your streak alive', body: 'You have a 12-day streak on News Recall Quiz. Play today’s round.', receivedAt: '1d ago' },
];

export const newsletters: NewsletterIssue[] = [
  { id: 'nl-1', title: 'The Friday Briefing: Banking & Energy', summary: '5 stories that moved Banking & Energy this week.', sentAt: 'Fri, 8:00am' },
  { id: 'nl-2', title: 'Market Movers Weekly', summary: 'NGX, naira, and the week’s biggest sector rotations.', sentAt: 'Last Friday' },
  { id: 'nl-3', title: 'Policy Watch', summary: 'What the new fiscal framework means for business.', sentAt: '2 weeks ago' },
];

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
  { id: 'inv-2', date: '1 Jun 2026', description: 'Premium Annual — renewal', amount: '₦25,000', status: 'Paid' },
  { id: 'inv-1', date: '1 Jun 2025', description: 'Premium Annual — first year', amount: '₦25,000', status: 'Paid' },
];

export const quizQuestions: QuizQuestion[] = [
  { id: 'q1', prompt: 'External reserves crossed what mark this week?', options: ['$30bn', '$40bn', '$50bn'], correctIndex: 1 },
  { id: 'q2', prompt: 'Which sector led the NGX rally reported today?', options: ['Oil & Gas', 'Banking', 'Telecoms'], correctIndex: 1 },
  { id: 'q3', prompt: 'What is Nigeria’s latest headline inflation rate?', options: ['18.2%', '22.1%', '27.25%'], correctIndex: 1 },
  { id: 'q4', prompt: 'What is the Dangote refinery’s stated capacity?', options: ['350,000 bpd', '650,000 bpd', '1m bpd'], correctIndex: 1 },
  { id: 'q5', prompt: 'By how much did the CBN raise its benchmark rate?', options: ['25bps', '50bps', '100bps'], correctIndex: 1 },
];

// design.md §6 — drives TodayScreen's mixed module layout. "Which articles go where" as data,
// not scattered filters inside the screen component.
export const todayModuleSequence: TodayModule[] = [
  { type: 'hero', articleId: 'art-breaking' },
  { type: 'briefRail', label: 'World in Brief', articleIds: ['art-2', 'art-4', 'art-6'] },
  { type: 'sectionLabel', label: 'Top Stories' },
  { type: 'cardList', articleIds: ['art-1', 'art-3', 'art-5'] },
  { type: 'tileGrid', label: 'Recent Highlights', articleIds: ['art-2', 'art-4'] },
  { type: 'textList', label: 'More from Markets', articleIds: ['art-1', 'art-6'] },
];
