import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// Feed screens only ever fetch on mount, so a reader who backgrounds the app and returns later
// keeps seeing whatever was loaded at launch until they manually pull to refresh. This re-runs the
// given loader whenever the app comes back to the foreground from actually being backgrounded —
// not on the initial mount's own transition into 'active', which the mount's own fetch already
// covers.
export function useRefreshOnForeground(onForeground: () => void) {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const callback = useRef(onForeground);
  callback.current = onForeground;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        callback.current();
      }
      appState.current = next;
    });
    return () => subscription.remove();
  }, []);
}
