import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import type { LanguageCode } from '../data/languages';

// Not every app language has a broadly-available on-device TTS voice (Yoruba/Igbo/Hausa
// especially) — map what's reasonably supported and let expo-speech fall back to the device
// default for the rest, rather than forcing a locale the OS can't actually speak.
const LOCALE_MAP: Partial<Record<LanguageCode, string>> = {
  en: 'en-US',
  fr: 'fr-FR',
  sw: 'sw-KE',
};

// expo-speech's pause()/resume() are iOS/web only (Android's TextToSpeech has no true pause
// primitive) — GlobalAudioPlayer reads this to decide whether its pause button can actually
// pause-and-resume, or only stop outright, rather than showing a control that silently does the
// wrong thing on Android.
export const canPauseSpeech = Platform.OS !== 'android';

export type SpeakingState = { id: string; title: string; isPaused: boolean } | null;

let current: SpeakingState = null;
const listeners = new Set<(state: SpeakingState) => void>();

function notify() {
  listeners.forEach((l) => l(current));
}

// Reader-reported live: once an article started speaking there was no way to pause, stop, or
// even tell it was still playing once you scrolled away from the top of the article — and it
// kept going after leaving the screen entirely, with the only way back to it being to reopen
// that exact article. GlobalAudioPlayer (mounted once at the app root, RootNavigator.tsx) is what
// actually fixes that; this module just needed to expose enough state (title, paused-ness) for a
// persistent bar to render anywhere, not only the ArticleReaderScreen that started it.
export function subscribeSpeaking(cb: (state: SpeakingState) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSpeakingState(): SpeakingState {
  return current;
}

// Only one thing ever speaks at a time — starting a new one stops whatever was playing.
// Toggling the currently-speaking id stops it.
export function toggleSpeak(id: string, text: string, title: string, language?: LanguageCode): void {
  if (current?.id === id) {
    Speech.stop();
    current = null;
    notify();
    return;
  }

  Speech.stop();
  current = { id, title, isPaused: false };
  notify();
  Speech.speak(text, {
    language: language ? LOCALE_MAP[language] : undefined,
    onDone: () => {
      if (current?.id === id) {
        current = null;
        notify();
      }
    },
    onStopped: () => {
      if (current?.id === id) {
        current = null;
        notify();
      }
    },
    onError: () => {
      if (current?.id === id) {
        current = null;
        notify();
      }
    },
  });
}

export function pauseSpeaking(): void {
  if (!current || current.isPaused) return;
  if (canPauseSpeech) {
    Speech.pause();
    current = { ...current, isPaused: true };
  } else {
    // No real pause on Android — stopping outright is the only honest option; a "paused" state
    // that can't actually resume would be worse than no pause button at all.
    Speech.stop();
    current = null;
  }
  notify();
}

export function resumeSpeaking(): void {
  if (!current?.isPaused) return;
  Speech.resume();
  current = { ...current, isPaused: false };
  notify();
}

export function stopSpeaking(): void {
  Speech.stop();
  current = null;
  notify();
}
