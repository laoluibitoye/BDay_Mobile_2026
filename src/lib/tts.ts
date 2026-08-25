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

let currentId: string | null = null;
const listeners = new Set<(id: string | null) => void>();

function notify() {
  listeners.forEach((l) => l(currentId));
}

export function subscribeSpeaking(cb: (id: string | null) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSpeakingId(): string | null {
  return currentId;
}

// Only one thing ever speaks at a time — starting a new one stops whatever was playing.
// Toggling the currently-speaking id stops it.
export function toggleSpeak(id: string, text: string, language?: LanguageCode): void {
  if (currentId === id) {
    Speech.stop();
    currentId = null;
    notify();
    return;
  }

  Speech.stop();
  currentId = id;
  notify();
  Speech.speak(text, {
    language: language ? LOCALE_MAP[language] : undefined,
    onDone: () => {
      if (currentId === id) {
        currentId = null;
        notify();
      }
    },
    onStopped: () => {
      if (currentId === id) {
        currentId = null;
        notify();
      }
    },
    onError: () => {
      if (currentId === id) {
        currentId = null;
        notify();
      }
    },
  });
}

export function stopSpeaking(): void {
  Speech.stop();
  currentId = null;
  notify();
}
