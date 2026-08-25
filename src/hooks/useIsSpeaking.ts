import { useEffect, useState } from 'react';
import { getSpeakingId, subscribeSpeaking } from '../lib/tts';

export function useIsSpeaking(id: string): boolean {
  const [speakingId, setSpeakingId] = useState(getSpeakingId());

  useEffect(() => subscribeSpeaking(setSpeakingId), []);

  return speakingId === id;
}
