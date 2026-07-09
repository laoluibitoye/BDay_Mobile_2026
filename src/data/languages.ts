export type LanguageCode = 'en' | 'fr' | 'ha' | 'yo' | 'ig' | 'sw';

export const LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'ha', label: 'Hausa', nativeLabel: 'Hausa' },
  { code: 'yo', label: 'Yoruba', nativeLabel: 'Yorùbá' },
  { code: 'ig', label: 'Igbo', nativeLabel: 'Igbo' },
  { code: 'sw', label: 'Swahili', nativeLabel: 'Kiswahili' },
];
