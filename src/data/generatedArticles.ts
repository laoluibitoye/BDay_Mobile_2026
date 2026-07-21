import { Article, ContentType } from './types';

// Deterministic PRNG (mulberry32) — same seed always produces the same mock feed, so
// screenshots/tests stay stable across reloads instead of reshuffling every launch.
function mulberry32(seed: number) {
  let s = seed;
  return function rnd() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rnd: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length) % arr.length];
}

function seedFromString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

const SECTION_SUBJECTS: Record<string, string[]> = {
  Banking: ['Access Holdings', 'GTCO', 'Zenith Bank', 'UBA', 'First Bank', 'Fidelity Bank', 'Sterling Bank', 'Stanbic IBTC', 'the CBN', 'Wema Bank'],
  Markets: ['the NGX All-Share Index', 'foreign portfolio investors', 'Tier-1 banking stocks', 'the local bourse', 'consumer goods stocks', 'the fixed income market', 'the Treasury bills market', 'industrial stocks', 'the equities market', 'oil & gas counters'],
  Energy: ['Dangote Refinery', 'NNPC', 'Seplat Energy', 'Shell Nigeria', 'TotalEnergies Nigeria', 'the Petroleum Industry Act', 'the DPR', 'Oando', 'Aradel Holdings', 'the national grid'],
  Technology: ['Flutterwave', 'Paystack', 'Moniepoint', 'MTN Nigeria', 'Interswitch', 'PalmPay', 'Kuda Bank', 'the NITDA', 'a leading fintech startup', 'a regional cloud provider'],
  Policy: ['the Federal Ministry of Finance', 'the National Assembly', 'the NBS', 'the CBN Monetary Policy Committee', 'the Debt Management Office', 'the Federal Inland Revenue Service', 'state governments', 'the Nigeria Customs Service', 'the Ministry of Trade', 'the fiscal policy team'],
  Opinion: ['policymakers', 'the private sector', 'regulators', 'boardrooms across the country', 'the next administration', 'institutional investors', 'the banking industry', 'small business owners', 'the tech ecosystem', 'the energy sector'],
};

const VERB_BANK = ['posted stronger-than-expected', 'reported softer', 'delivered mixed', 'posted record', 'beat consensus on'];
const DRIVER_BANK = ['resilient demand', 'currency headwinds', 'cost discipline', 'a tough operating environment', 'improved margins', 'higher transaction volumes'];
const MOVE_VERB_BANK = ['rally', 'slide', 'climb', 'dip', 'surge', 'edge higher'];
const EVENT_BANK = ['a stronger-than-expected earnings beat', 'a surprise regulatory ruling', 'renewed investor interest', 'a credit rating review', 'a leadership change', 'a new capital raise'];
const INITIATIVE_BANK = ['expansion plans', 'a new product line', 'digital infrastructure', 'regional expansion', 'a strategic partnership', 'a cost-cutting programme'];
const AUDIENCE_BANK = ['investors', 'small businesses', 'consumers', 'the broader economy', 'exporters'];
const CHALLENGE_BANK = ['rising costs', 'regulatory scrutiny', 'a liquidity squeeze', 'competitive pressure', 'supply chain disruption'];
const CONTEXT_BANK = ['the sector adjusts to new policy direction', 'global conditions remain uncertain', 'the naira stays volatile', 'inflation stays elevated', 'interest rates stay restrictive'];
const ADVICE_BANK = ['diversify its revenue base', 'accelerate its digital transition', 'improve disclosure standards', 'rethink its pricing strategy', 'invest more in compliance'];
const ROLE_BANK = ['Chief Financial Officer', 'Chief Executive', 'Head of Risk', 'Chief Operating Officer', 'Country Director'];
const TOPIC_BANK = ['the outlook for the sector', 'regulatory headwinds', 'growth strategy', 'the path to profitability', 'the next 12 months'];
const GOAL_BANK = ['market share', 'profitability', 'operational efficiency', 'customer growth', 'balance sheet resilience'];
const METRIC_BANK = ['margins', 'market share', 'cost-to-income ratio', 'growth', 'return on equity'];
const PERIOD_BANK = ['quarter', 'half-year', 'financial year', 'month'];
const DEK_BANK = [
  'BusinessDay examines what this means for the sector and investors in the weeks ahead.',
  'The development comes as market watchers reassess the outlook for the rest of the year.',
  'It is the latest signal in a sector navigating a fast-shifting policy and macro backdrop.',
  'Analysts say the move could reshape competitive dynamics across the industry.',
  'The story adds to a run of headlines shaping sentiment this reporting season.',
];

type Template = (subject: string, rnd: () => number) => { headline: string; dek: string };

const TEMPLATES: Template[] = [
  (subject, rnd) => ({
    headline: `${subject} ${pick(rnd, VERB_BANK)} ${pick(rnd, PERIOD_BANK)} results as ${pick(rnd, DRIVER_BANK)} kicks in`,
    dek: pick(rnd, DEK_BANK),
  }),
  (subject, rnd) => ({
    headline: `${subject} shares ${pick(rnd, MOVE_VERB_BANK)} ${(rnd() * 9.6 + 0.3).toFixed(1)}% after ${pick(rnd, EVENT_BANK)}`,
    dek: pick(rnd, DEK_BANK),
  }),
  (subject, rnd) => ({
    headline: `${subject} to invest ₦${Math.round(rnd() * 495 + 5)}bn in ${pick(rnd, INITIATIVE_BANK)}`,
    dek: pick(rnd, DEK_BANK),
  }),
  (subject, rnd) => ({
    headline: `Explainer: What ${subject}'s latest move means for ${pick(rnd, AUDIENCE_BANK)}`,
    dek: pick(rnd, DEK_BANK),
  }),
  (subject, rnd) => ({
    headline: `${subject} faces ${pick(rnd, CHALLENGE_BANK)} as ${pick(rnd, CONTEXT_BANK)}`,
    dek: pick(rnd, DEK_BANK),
  }),
  (subject, rnd) => ({
    headline: `Opinion: Why ${subject} should ${pick(rnd, ADVICE_BANK)}`,
    dek: pick(rnd, DEK_BANK),
  }),
  (subject, rnd) => ({
    headline: `${subject} names new ${pick(rnd, ROLE_BANK)} amid ${pick(rnd, CONTEXT_BANK)}`,
    dek: pick(rnd, DEK_BANK),
  }),
  (subject, rnd) => ({
    headline: `Q&A: A conversation on ${pick(rnd, TOPIC_BANK)} at ${subject}`,
    dek: pick(rnd, DEK_BANK),
  }),
  (subject, rnd) => ({
    headline: `${subject} eyes ${pick(rnd, INITIATIVE_BANK)} to boost ${pick(rnd, GOAL_BANK)}`,
    dek: pick(rnd, DEK_BANK),
  }),
  (subject, rnd) => ({
    headline: `Data: How ${subject} compares on ${pick(rnd, METRIC_BANK)} this ${pick(rnd, PERIOD_BANK)}`,
    dek: pick(rnd, DEK_BANK),
  }),
];

// Secondary taxonomy tags per section — beyond the 7 Home category tabs, so the Explore tag
// cloud has real sub-topics (30+ total, design ask) with real matching content, not just the
// 7 top-level sections repeated. A generated article gets 0-2 of its section's tags.
export const SECTION_EXTRA_TAGS: Record<string, string[]> = {
  Banking: ['Fintech', 'Interest Rates', 'Digital Payments', 'Capital Markets'],
  Markets: ['NGX', 'Investor Sentiment', 'Equities', 'Fixed Income'],
  Energy: ['Oil & Gas', 'Renewable Energy', 'Power Sector', 'Gas Exports'],
  Technology: ['Startups', 'E-commerce', 'Cybersecurity', 'Telecoms'],
  Policy: ['Taxation', 'Public Debt', 'Inflation', 'Trade Policy'],
  Opinion: ['Leadership', 'Governance', 'Regulation', 'Economic Outlook'],
};

export const ALL_EXTRA_TAGS: string[] = Array.from(new Set(Object.values(SECTION_EXTRA_TAGS).flat()));

const HERO_COLORS = ['#F73200', '#333333', '#111111', '#1E7F4C', '#B22800'];
const CONTENT_TYPE_WEIGHTED: ContentType[] = ['news', 'news', 'news', 'analysis', 'analysis', 'report', 'data'];

function publishedAtLabel(rnd: () => number): string {
  const tier = rnd();
  if (tier < 0.55) return `${1 + Math.floor(rnd() * 22)}h ago`;
  if (tier < 0.9) return `${1 + Math.floor(rnd() * 6)}d ago`;
  return `${1 + Math.floor(rnd() * 3)}w ago`;
}

// Generates a deterministic pool of plausible-looking articles for a section so every
// Home category tab / taxonomy archive has enough real content to scroll through (design ask:
// minimum 100 posts per tab) without hand-authoring hundreds of headlines.
export function buildSectionArticles(section: string, count: number, authorIds: string[]): Article[] {
  const rnd = mulberry32(seedFromString(`bd-${section}`));
  const subjects = SECTION_SUBJECTS[section] ?? SECTION_SUBJECTS.Opinion;
  const extraTags = SECTION_EXTRA_TAGS[section] ?? [];
  const out: Article[] = [];

  for (let i = 0; i < count; i++) {
    const subject = pick(rnd, subjects);
    const template = pick(rnd, TEMPLATES);
    const { headline, dek } = template(subject, rnd);
    const isBrief = rnd() < 0.2;
    const isPremium = rnd() < 0.25;
    const id = `gen-${section.toLowerCase().replace(/\s+/g, '-')}-${i}`;
    const tagRoll = rnd();
    const tags =
      tagRoll < 0.1 || extraTags.length === 0
        ? undefined
        : tagRoll < 0.75
          ? [pick(rnd, extraTags)]
          : [pick(rnd, extraTags), pick(rnd, extraTags)];

    out.push({
      id,
      headline,
      dek,
      section,
      authorId: pick(rnd, authorIds),
      publishedAt: publishedAtLabel(rnd),
      contentType: pick(rnd, CONTENT_TYPE_WEIGHTED),
      isPremium,
      readTime: `${2 + Math.floor(rnd() * 8)} min read`,
      heroColor: pick(rnd, HERO_COLORS),
      // Every generated article gets a real photo — `heroColor` still exists as ArticleImage's
      // fallback while the photo loads or if the URL ever fails, not as a deliberate no-photo case.
      imageUrl: `https://picsum.photos/seed/${id}/800/600`,
      isBrief,
      tags,
      commentCount: rnd() < 0.4 ? Math.floor(rnd() * 60) : undefined,
      body: isBrief
        ? [dek, pick(rnd, DEK_BANK)]
        : [
            `${headline}. ${dek}`,
            `Sources close to the matter told BusinessDay the development follows weeks of internal discussion, with ${pick(rnd, AUDIENCE_BANK)} watching closely for follow-through.`,
            `The picture that emerges is one of a sector in transition — ${pick(rnd, CONTEXT_BANK)}, even as individual players chart their own path through it.`,
            `BusinessDay will continue to track this story as more details emerge.`,
          ],
    });
  }

  return out;
}
