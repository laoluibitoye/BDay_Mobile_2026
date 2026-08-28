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

// expo-speech's pause()/resume() are iOS/web only — Android's TextToSpeech has no true
// pause-and-resume-from-position primitive at all. Reader-reported live: pausing on Android was
// implemented as Speech.stop() + clearing all state, which made the entire player bar vanish —
// indistinguishable from tapping the stop/X button, and there was no way back to it short of
// reopening the article. GlobalAudioPlayer needs to stay visible either way; on Android,
// "resume" instead means restarting the same text from the top (the only thing actually
// possible), not truly continuing from where it left off.
export const canPauseSpeech = Platform.OS !== 'android';

type SpeakingInternal = { id: string; title: string; text: string; language?: LanguageCode; isPaused: boolean };
export type SpeakingState = { id: string; title: string; isPaused: boolean } | null;

let current: SpeakingInternal | null = null;
const listeners = new Set<(state: SpeakingState) => void>();

function publicState(): SpeakingState {
  return current ? { id: current.id, title: current.title, isPaused: current.isPaused } : null;
}

function notify() {
  listeners.forEach((l) => l(publicState()));
}

function speakCurrent() {
  if (!current) return;
  const id = current.id;
  Speech.speak(current.text, {
    language: current.language ? LOCALE_MAP[current.language] : undefined,
    onDone: () => {
      if (current?.id === id) {
        current = null;
        notify();
      }
    },
    // Speech.stop() also fires onStopped — including the stop pauseSpeaking() issues on
    // Android to simulate a pause. Only treat it as "really stopped" when we're not mid-pause,
    // or this would immediately undo the isPaused state pauseSpeaking() just set.
    onStopped: () => {
      if (current?.id === id && !current.isPaused) {
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
  return publicState();
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
  current = { id, title, text, language, isPaused: false };
  notify();
  speakCurrent();
}

export function pauseSpeaking(): void {
  if (!current || current.isPaused) return;
  current = { ...current, isPaused: true };
  notify();
  if (canPauseSpeech) {
    Speech.pause();
  } else {
    // No real pause on Android — stop is the only primitive available, but (unlike the old
    // behavior) the player bar and its text/language stay in `current` so resumeSpeaking() can
    // restart it and the bar never disappears just from pausing.
    Speech.stop();
  }
}

export function resumeSpeaking(): void {
  if (!current?.isPaused) return;
  if (canPauseSpeech) {
    Speech.resume();
    current = { ...current, isPaused: false };
    notify();
  } else {
    current = { ...current, isPaused: false };
    notify();
    speakCurrent();
  }
}

export function stopSpeaking(): void {
  Speech.stop();
  current = null;
  notify();
}
