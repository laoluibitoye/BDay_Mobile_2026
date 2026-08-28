import { useEffect, useState } from 'react';
import { getSpeakingState, subscribeSpeaking } from '../lib/tts';

export function useIsSpeaking(id: string): boolean {
  const [state, setState] = useState(getSpeakingState());

  useEffect(() => subscribeSpeaking(setState), []);

  return state?.id === id;
}
