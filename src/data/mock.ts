import { Persona } from './types';

// Categorical UI config, not editorial content — these mirror what a real WP taxonomy/category
// list would contain, but aren't fetched live yet (IMPLEMENTATION_PLAN.md §9.5 plans a WP-admin
// "App content curation" plugin to eventually own this).
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

export const personas: Persona[] = [
  { id: 'investor', label: 'Investor', description: 'Track markets, earnings, and macro moves that affect your portfolio.' },
  { id: 'entrepreneur', label: 'Entrepreneur', description: 'Follow policy, funding, and sector trends that shape your business.' },
  { id: 'policy', label: 'Policy professional', description: 'Deep, sourced coverage of regulation and government decisions.' },
  { id: 'student', label: 'Student', description: 'Business fundamentals and context, explained clearly.' },
  { id: 'general', label: 'General reader', description: 'A broad, curated view of the day’s business news.' },
];
